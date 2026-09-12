/* 
  DEVELOPER NOTE:
  The legal terms in this document have been customized to match the actual implemented features, data schemas, 
  and infrastructure of the Elite Legal Desk platform. However, prior to formal commercial/production deployment, 
  these Terms & Conditions should be reviewed and confirmed by a qualified legal professional under applicable laws 
  (including Indian law).
*/

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, FileText, ArrowUp, Mail, MapPin, AlertTriangle, ShieldCheck, Scale as ScaleIcon } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-200">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <img 
              src="/logo.jpg" 
              alt="Elite Legal Desk Logo" 
              className="h-10 w-10 object-contain rounded-full shadow-md border border-amber-500/40 bg-white group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-wider text-slate-900 dark:text-white uppercase leading-none group-hover:text-primary dark:group-hover:text-sky-400 transition-colors">
                ELITE LEGAL DESK
              </h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">
                MADANAPALLE
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10">
          
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-2.5 text-xs font-bold text-primary dark:text-sky-400 uppercase tracking-wider mb-2">
              <FileText size={16} /> Platform Usage Agreement
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Terms & Conditions
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span><strong>Last Updated:</strong> September 12, 2026</span>
              <span>•</span>
              <span><strong>Platform:</strong> Elite Legal Desk</span>
            </div>
          </div>

          {/* Table of Contents Quick Links */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 mb-8 text-xs">
            <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5">
              Document Summary & Index:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <a href="#section-1" className="hover:text-primary dark:hover:text-sky-400 hover:underline">1. Introduction</a>
              <a href="#section-2" className="hover:text-primary dark:hover:text-sky-400 hover:underline">2. Acceptance of Terms</a>
              <a href="#section-3" className="hover:text-primary dark:hover:text-sky-400 hover:underline">3. Eligibility</a>
              <a href="#section-4" className="hover:text-primary dark:hover:text-sky-400 hover:underline">4. Account Registration</a>
              <a href="#section-5" className="hover:text-primary dark:hover:text-sky-400 hover:underline">5. Client Accounts</a>
              <a href="#section-6" className="hover:text-primary dark:hover:text-sky-400 hover:underline">6. Advocate Accounts</a>
              <a href="#section-7" className="hover:text-primary dark:hover:text-sky-400 hover:underline">7. Admin Verification</a>
              <a href="#section-8" className="hover:text-primary dark:hover:text-sky-400 hover:underline font-bold text-amber-600 dark:text-amber-400">8. Legal Info Disclaimer</a>
              <a href="#section-9" className="hover:text-primary dark:hover:text-sky-400 hover:underline">9. Advocate-Client Relationship</a>
              <a href="#section-10" className="hover:text-primary dark:hover:text-sky-400 hover:underline">10. User Conduct</a>
              <a href="#section-11" className="hover:text-primary dark:hover:text-sky-400 hover:underline">11. Uploaded Documents</a>
              <a href="#section-12" className="hover:text-primary dark:hover:text-sky-400 hover:underline">12. Calculators Disclaimer</a>
              <a href="#section-13" className="hover:text-primary dark:hover:text-sky-400 hover:underline">13. Third-Party Services</a>
              <a href="#section-14" className="hover:text-primary dark:hover:text-sky-400 hover:underline">14. Intellectual Property</a>
              <a href="#section-15" className="hover:text-primary dark:hover:text-sky-400 hover:underline">15. Service Availability</a>
              <a href="#section-16" className="hover:text-primary dark:hover:text-sky-400 hover:underline">16. Limitation of Liability</a>
              <a href="#section-17" className="hover:text-primary dark:hover:text-sky-400 hover:underline">17. Indemnification</a>
              <a href="#section-18" className="hover:text-primary dark:hover:text-sky-400 hover:underline">18. Account Suspension</a>
              <a href="#section-19" className="hover:text-primary dark:hover:text-sky-400 hover:underline">19. Governing Law</a>
              <a href="#section-20" className="hover:text-primary dark:hover:text-sky-400 hover:underline">20. Changes to Terms</a>
              <a href="#section-21" className="hover:text-primary dark:hover:text-sky-400 hover:underline">21. Contact Information</a>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">

            {/* 1. Introduction */}
            <section id="section-1" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">01.</span> Introduction
              </h2>
              <p>
                These Terms & Conditions ("Terms") govern your access to and use of Elite Legal Desk ("the Platform"), accessible via <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-primary dark:text-sky-400">www.elitelegaldesk.com</code>.
              </p>
              <p className="mt-2">
                Elite Legal Desk is an enterprise legal workflow management system, advocate directory, court fee calculator, and legal document repository built to support practicing advocates, legal corporate counsels, and citizens.
              </p>
            </section>

            {/* 2. Acceptance of Terms */}
            <section id="section-2" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">02.</span> Acceptance of Terms
              </h2>
              <p>
                By creating an account, signing in via Google, or using any feature of Elite Legal Desk, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use the Platform.
              </p>
            </section>

            {/* 3. Eligibility */}
            <section id="section-3" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">03.</span> Eligibility
              </h2>
              <p>
                You must be at least 18 years of age and possess the legal capacity to enter into binding agreements under applicable Indian law to use this Platform.
              </p>
            </section>

            {/* 4. Account Registration */}
            <section id="section-4" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">04.</span> Account Registration & Responsibilities
              </h2>
              <p>
                When creating an account on Elite Legal Desk, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the confidentiality of your login credentials and authentication sessions.</li>
                <li>Not share account access with unauthorized third parties or impersonate another individual.</li>
                <li>Promptly notify platform support of any unauthorized use or security compromise.</li>
              </ul>
            </section>

            {/* 5. Client Accounts */}
            <section id="section-5" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">05.</span> Client Accounts
              </h2>
              <p>
                Client accounts allow citizens and corporate entities to search advocate directories, utilize legal calculators, access bare acts, and collaborate with assigned advocates in secure project workspaces.
              </p>
            </section>

            {/* 6. Advocate Accounts */}
            <section id="section-6" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">06.</span> Advocate Accounts
              </h2>
              <p>
                Users registering as Advocates represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>They hold a valid Bar Council Enrollment Number issued by a recognized State Bar Council in India.</li>
                <li>All professional details, including enrollment date, practicing courts, and specializations, are truthful and accurate.</li>
                <li>They will comply with all professional conduct rules prescribed by the Bar Council of India.</li>
              </ul>
            </section>

            {/* 7. Admin Verification */}
            <section id="section-7" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">07.</span> Admin Verification
              </h2>
              <p>
                Advocate profiles are subject to review and verification by platform administrators. While verification checks confirm the submission of Bar Council enrollment details, Elite Legal Desk does not independently guarantee the legal outcomes or performance of any advocate listed in the directory.
              </p>
            </section>

            {/* 8. Legal Information Disclaimer (CRITICAL) */}
            <section id="section-8" className="scroll-mt-20 p-5 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                <span className="font-mono text-base">08.</span> Legal Information & Tool Disclaimer
              </h2>
              <div className="space-y-2 text-slate-800 dark:text-slate-200">
                <p className="font-semibold">
                  ELITE LEGAL DESK IS A DIGITAL TECHNOLOGY PLATFORM AND WORKFLOW SUITE. IT IS NOT A LAW FIRM AND DOES NOT PROVIDE FORMAL LEGAL ADVICE.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Calculators, Bare Acts, Court Fees Act tables, BNS/IPC section mappings, and judgements provided on the Platform are for <strong>informational and estimation purposes only</strong>.</li>
                  <li>Legal outcomes depend on specific case facts, judicial interpretations, and current statutory amendments.</li>
                  <li>Calculations and statutory text do not constitute formal legal opinions or legal representation.</li>
                  <li>Users must consult a qualified legal professional for advice concerning their specific legal matters.</li>
                </ul>
              </div>
            </section>

            {/* 9. Advocate-Client Relationship */}
            <section id="section-9" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">09.</span> Advocate-Client Relationship
              </h2>
              <p>
                Any professional engagement, retainership, or advocate-client relationship established between users is strictly between the advocate and client involved. Elite Legal Desk acts solely as an intermediary technology platform facilitating collaboration and is not a party to advocate-client fee agreements or representation contracts.
              </p>
            </section>

            {/* 10. User Conduct */}
            <section id="section-10" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">10.</span> User Conduct & Prohibited Activities
              </h2>
              <p className="mb-2">Users must not:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Submit false Bar Council enrollment numbers or impersonate legal practitioners.</li>
                <li>Upload malicious code, viruses, or unauthorized automated access scripts.</li>
                <li>Attempt to bypass platform authentication controls or security firewalls.</li>
                <li>Harass, abuse, or send fraudulent communications to other platform users.</li>
                <li>Violate any applicable local, state, or national laws of India.</li>
              </ul>
            </section>

            {/* 11. Documents and Uploaded Content */}
            <section id="section-11" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">11.</span> User-Uploaded Documents
              </h2>
              <p>
                Users retain full ownership of documents and files uploaded to project workspaces. By uploading files, you represent that you possess the necessary authority to share those documents for case collaboration.
              </p>
            </section>

            {/* 12. Court Fee and Land Conversion Calculators */}
            <section id="section-12" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">12.</span> Calculators Disclaimer
              </h2>
              <p>
                Court fee calculations are based on statutory schedule tables (e.g., Andhra Pradesh Court Fees and Suits Valuation Act). Land conversion fee calculations utilize standard regional conversion ratios. Results represent statutory estimates. Users and practitioners must verify applicable rates with official court registries or revenue departments prior to official filing.
              </p>
            </section>

            {/* 13. Third-Party Services */}
            <section id="section-13" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">13.</span> Third-Party Services
              </h2>
              <p>
                Platform features depend on trusted third-party infrastructure, including Google Identity Services for authentication, MongoDB Atlas for data persistence, Nodemailer for email notifications, and Vercel/Render for hosting. Use of these services is subject to their respective availability and operation.
              </p>
            </section>

            {/* 14. Intellectual Property */}
            <section id="section-14" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">14.</span> Intellectual Property
              </h2>
              <p>
                All software, user interface design, branding, logo assets, and custom code components of Elite Legal Desk are the intellectual property of the Platform. Public domain legal texts, Bare Acts, and public court judgements remain in the public domain or belong to their respective statutory authorities.
              </p>
            </section>

            {/* 15. Availability of Services */}
            <section id="section-15" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">15.</span> Service Availability
              </h2>
              <p>
                We strive to maintain high availability; however, the Platform is provided on an "as is" and "as available" basis. Access may be temporarily suspended for routine maintenance, infrastructure upgrades, or emergency technical resolution.
              </p>
            </section>

            {/* 16. Limitation of Liability */}
            <section id="section-16" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">16.</span> Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable Indian law, Elite Legal Desk and its administrators shall not be liable for indirect, incidental, consequential, or punitive damages arising from your use of the Platform or reliance on calculator estimates.
              </p>
            </section>

            {/* 17. Indemnification */}
            <section id="section-17" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">17.</span> Indemnification
              </h2>
              <p>
                You agree to indemnify and hold harmless Elite Legal Desk, its administrators, and team members from claims, damages, or liabilities arising out of your violation of these Terms, submission of fraudulent information, or misuse of the Platform.
              </p>
            </section>

            {/* 18. Suspension or Termination */}
            <section id="section-18" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">18.</span> Account Suspension or Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms, provide fraudulent enrollment credentials, or engage in unauthorized system access or security tampering.
              </p>
            </section>

            {/* 19. Governing Law and Jurisdiction */}
            <section id="section-19" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">19.</span> Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India. Any legal disputes arising out of or in connection with the Platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Madanapalle, Andhra Pradesh, India</strong>.
              </p>
            </section>

            {/* 20. Changes to Terms */}
            <section id="section-20" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">20.</span> Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. Updated versions will be posted on this page with an updated "Last Updated" date. Your continued use of the Platform after updates constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* 21. Contact Us */}
            <section id="section-21" className="scroll-mt-20 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">21.</span> Contact Information
              </h2>
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Elite Legal Desk Administration
                </p>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <MapPin size={14} className="text-primary dark:text-sky-400 flex-shrink-0" />
                  <span><strong>Founder:</strong> Mr. P. V. Prasad, Advocate, Madanapalle, Andhra Pradesh, India</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Mail size={14} className="text-primary dark:text-sky-400 flex-shrink-0" />
                  <span><strong>Platform Support:</strong> Support available through logged-in platform desk</span>
                </p>
              </div>
            </section>

          </div>

          {/* Footer Navigation within Document */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="text-primary dark:text-sky-400 hover:underline font-semibold"
              >
                View Privacy Policy →
              </button>
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Back to Top <ArrowUp size={14} />
            </button>
          </div>

        </div>
      </main>

    </div>
  );
};

export default TermsAndConditions;
