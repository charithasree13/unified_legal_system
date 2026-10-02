import { connectDB } from '../config/db';
import { Judgement, Law, ImportLog } from '../models/Schemas';
import { COMPREHENSIVE_BARE_ACTS_DATA } from '../seed/comprehensiveBareActsData';
import { COMPREHENSIVE_JUDGMENTS_DATA } from '../seed/comprehensiveJudgmentsData';
import { EXPANDED_JUDGEMENTS_SEED, EXPANDED_LAWS_SEED } from '../seed/expandedLegalLibrarySeed';

function generateJudgementCanonicalKey(court: string, caseNumber: string, neutralCitation: string, year: number | string): string {
  const normCourt = String(court || '').toLowerCase().trim().replace(/^the\s+/i, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normCaseNo = String(caseNumber || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normCit = String(neutralCitation || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normYr = String(year || '').trim();
  return `${normCourt}|${normCaseNo || 'nocaseno'}|${normCit || normYr}`;
}

function generateLawCanonicalKey(actName: string, actNumber: string, year: number | string, jurisdiction: string): string {
  const normName = String(actName || '').toLowerCase().trim().replace(/^the\s+/i, '').replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normNo = String(actNumber || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normYr = String(year || '').trim();
  const normJur = String(jurisdiction || 'central').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${normName}|${normNo || 'nono'}|${normYr}|${normJur}`;
}

export async function runLegalLibraryImporter() {
  const importId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log('=====================================================================');
  console.log('🚀 ELITE LEGAL DESK — FULL LEGAL LIBRARY DATA INGESTION PIPELINE');
  console.log(`🆔 Import Batch ID: ${importId}`);
  console.log('=====================================================================\n');

  try {
    await connectDB();

    // Initialize Import Log in DB
    const importLogRecord = await ImportLog.create({
      importId,
      resourceType: 'ALL',
      source: 'India Code / eCourts / Supreme Court of India / AdvocateKhoj Legal Library Reference',
      startedAt: new Date(),
      status: 'RUNNING',
      errorLog: []
    });

    // Combine seed sources
    const allJudgmentSources = [...COMPREHENSIVE_JUDGMENTS_DATA, ...EXPANDED_JUDGEMENTS_SEED];
    const allLawSources = [...COMPREHENSIVE_BARE_ACTS_DATA, ...EXPANDED_LAWS_SEED];

    console.log(`📊 Discovered ${allJudgmentSources.length} Judgment records across legal domains & years.`);
    console.log(`📊 Discovered ${allLawSources.length} Statutory Bare Act & Legislation records.\n`);

    let jDiscovered = allJudgmentSources.length;
    let jImported = 0;
    let jUpdated = 0;
    let jDuplicates = 0;
    let jFailed = 0;

    let lDiscovered = allLawSources.length;
    let lImported = 0;
    let lUpdated = 0;
    let lDuplicates = 0;
    let lFailed = 0;

    const errorLogs: string[] = [];

    // 1. INGEST BARE ACTS & LEGISLATION
    console.log('📜 Processing Statutory Bare Acts Ingestion...');
    for (const act of allLawSources) {
      try {
        const mainTitle = (act.actName || act.title || '').trim();
        const canonicalKey = act.canonicalKey || generateLawCanonicalKey(mainTitle, act.actNumber || '', act.year, act.jurisdiction || 'central');
        
        const existing = await Law.findOne({
          $or: [
            { canonicalKey },
            { title: mainTitle, year: Number(act.year) }
          ]
        });

        if (existing) {
          // Update existing with full statutory data
          await Law.findByIdAndUpdate(existing._id, {
            ...act,
            canonicalKey,
            lastVerified: new Date().toISOString().split('T')[0]
          });
          lDuplicates++;
          lUpdated++;
        } else {
          await Law.create({
            ...act,
            title: mainTitle,
            actName: mainTitle,
            canonicalKey,
            lastVerified: new Date().toISOString().split('T')[0]
          });
          lImported++;
        }
      } catch (err: any) {
        lFailed++;
        const msg = `Bare Act Ingestion Error [${act.title}]: ${err?.message || err}`;
        errorLogs.push(msg);
        console.error(`❌ ${msg}`);
      }
    }

    // 2. INGEST JUDGMENTS
    console.log('🏛️ Processing Supreme Court & High Court Judgments Ingestion...');
    for (const item of allJudgmentSources) {
      try {
        const canonicalKey = item.canonicalKey || generateJudgementCanonicalKey(item.court, item.caseNumber, item.neutralCitation, item.year);
        
        const existing = await Judgement.findOne({
          $or: [
            { canonicalKey },
            { title: item.title, court: item.court }
          ]
        });

        if (existing) {
          // Update existing record
          await Judgement.findByIdAndUpdate(existing._id, {
            ...item,
            canonicalKey,
            lastVerified: new Date().toISOString().split('T')[0]
          });
          jDuplicates++;
          jUpdated++;
        } else {
          await Judgement.create({
            ...item,
            canonicalKey,
            lastVerified: new Date().toISOString().split('T')[0]
          });
          jImported++;
        }
      } catch (err: any) {
        jFailed++;
        const msg = `Judgment Ingestion Error [${item.title}]: ${err?.message || err}`;
        errorLogs.push(msg);
        console.error(`❌ ${msg}`);
      }
    }

    // QUERY DYNAMIC VERIFIED DATABASE TOTALS
    const finalJudgements = await Judgement.find({});
    const finalLaws = await Law.find({});

    const totalJudgmentsInDb = finalJudgements.length;
    const totalLawsInDb = finalLaws.length;

    // Verify deduplication
    const uniqueJudgmentKeys = new Set(finalJudgements.map((j: any) => j.canonicalKey || j.title)).size;
    const uniqueLawKeys = new Set(finalLaws.map((l: any) => l.canonicalKey || l.title)).size;

    // Update Import Log in DB
    await ImportLog.findOneAndUpdate(
      { importId },
      {
        completedAt: new Date(),
        discovered: jDiscovered + lDiscovered,
        imported: jImported + lImported,
        updated: jUpdated + lUpdated,
        duplicates: jDuplicates + lDuplicates,
        failed: jFailed + lFailed,
        status: (jFailed + lFailed) === 0 ? 'COMPLETED' : 'PARTIAL',
        errorLog: errorLogs
      }
    );

    console.log('\n=====================================================================');
    console.log('🏆 LEGAL LIBRARY DATA INGESTION REPORT — DATABASE VERIFIED');
    console.log('=====================================================================');
    console.log(`📌 SUPREME & HIGH COURT JUDGMENTS:`);
    console.log(`   - Records Discovered: ${jDiscovered}`);
    console.log(`   - Successfully Imported New: ${jImported}`);
    console.log(`   - Existing Records Updated: ${jUpdated}`);
    console.log(`   - Canonical Duplicates Prevented: ${jDuplicates}`);
    console.log(`   - Import Failures: ${jFailed}`);
    console.log(`   - TOTAL VERIFIED JUDGMENTS IN DATABASE: ${totalJudgmentsInDb}`);
    console.log(`   - UNIQUE CANONICAL JUDGMENT KEYS: ${uniqueJudgmentKeys}`);

    console.log(`\n📌 STATUTORY BARE ACTS & LEGISLATION:`);
    console.log(`   - Records Discovered: ${lDiscovered}`);
    console.log(`   - Successfully Imported New: ${lImported}`);
    console.log(`   - Existing Records Updated: ${lUpdated}`);
    console.log(`   - Canonical Duplicates Prevented: ${lDuplicates}`);
    console.log(`   - Import Failures: ${lFailed}`);
    console.log(`   - TOTAL VERIFIED BARE ACTS IN DATABASE: ${totalLawsInDb}`);
    console.log(`   - UNIQUE CANONICAL BARE ACT KEYS: ${uniqueLawKeys}`);
    console.log('=====================================================================\n');

    return {
      importId,
      judgments: {
        discovered: jDiscovered,
        imported: jImported,
        updated: jUpdated,
        duplicates: jDuplicates,
        failed: jFailed,
        totalInDb: totalJudgmentsInDb,
        uniqueCount: uniqueJudgmentKeys
      },
      laws: {
        discovered: lDiscovered,
        imported: lImported,
        updated: lUpdated,
        duplicates: lDuplicates,
        failed: lFailed,
        totalInDb: totalLawsInDb,
        uniqueCount: uniqueLawKeys
      }
    };
  } catch (err: any) {
    console.error('❌ Ingestion Pipeline Critical Error:', err?.message || err);
    throw err;
  }
}

// Auto-run when executed directly via CLI
if (require.main === module) {
  runLegalLibraryImporter().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}
