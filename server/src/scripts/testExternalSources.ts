import https from 'https';

const sslAgent = new https.Agent({ rejectUnauthorized: false });

function fetchExternalUrl(url: string, timeoutMs = 8000): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: sslAgent, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EliteLegalDesk/2.0' }, timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('External source timeout')); });
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function testFetchAndClean(docId: string) {
  console.log(`Testing dynamic on-demand retrieval for doc: ${docId}`);
  const url = `https://indiankanoon.org/doc/${docId}/`;
  const res = await fetchExternalUrl(url);
  if (res.status !== 200) {
    throw new Error(`Failed with status: ${res.status}`);
  }

  const titleMatch = res.body.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripHtml(titleMatch[1]) : 'Judicial Document';

  const docSourceMatch = res.body.match(/class="docsource[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const source = docSourceMatch ? stripHtml(docSourceMatch[1]) : 'Supreme Court of India';

  // Extract body
  const bodyMatch = res.body.match(/<div class="judgments">([\s\S]*?)<\/div>\s*<\/div>/i) ||
                    res.body.match(/<div class="doc_body">([\s\S]*?)<\/div>/i) ||
                    res.body.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);

  const rawContent = bodyMatch ? bodyMatch[1] : res.body;
  const cleaned = rawContent
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<blockquote[^>]*>/gi, '\n> ')
    .replace(/<\/blockquote>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  console.log('Title:', title);
  console.log('Source:', source);
  console.log('Text length:', cleaned.length);
  console.log('Preview:');
  console.log(cleaned.substring(0, 350));
}

testFetchAndClean('1766147').catch(console.error);
