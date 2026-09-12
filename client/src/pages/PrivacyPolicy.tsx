/* 
  DEVELOPER NOTE:
  The legal text in this document has been customized to match the actual implemented features, data schemas, 
  and infrastructure of the Elite Legal Desk platform. However, prior to formal commercial/production deployment, 
  this Privacy Policy should be reviewed and confirmed by a qualified legal professional under applicable laws 
  (including the Digital Personal Data Protection Act, 2023 of India).
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, Shield, ArrowUp, Mail, MapPin, CheckCircle2, Lock, FileText, Database, UserCheck, Bell } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const [copiedContact, setCopiedContact] = useState(false);

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
              <Shield size={16} /> Legal & Compliance Documentation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Privacy Policy
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
              <a href="#section-2" className="hover:text-primary dark:hover:text-sky-400 hover:underline">2. Information We Collect</a>
              <a href="#section-3" className="hover:text-primary dark:hover:text-sky-400 hover:underline">3. Google Authentication</a>
              <a href="#section-4" className="hover:text-primary dark:hover:text-sky-400 hover:underline">4. How We Use Information</a>
              <a href="#section-5" className="hover:text-primary dark:hover:text-sky-400 hover:underline">5. Legal Documents & Content</a>
              <a href="#section-6" className="hover:text-primary dark:hover:text-sky-400 hover:underline">6. Information Sharing</a>
              <a href="#section-7" className="hover:text-primary dark:hover:text-sky-400 hover:underline">7. Data Security</a>
              <a href="#section-8" className="hover:text-primary dark:hover:text-sky-400 hover:underline">8. Data Retention</a>
              <a href="#section-9" className="hover:text-primary dark:hover:text-sky-400 hover:underline">9. Cookies & Local Storage</a>
              <a href="#section-10" className="hover:text-primary dark:hover:text-sky-400 hover:underline">10. Third-Party Services</a>
              <a href="#section-11" className="hover:text-primary dark:hover:text-sky-400 hover:underline">11. User Rights & Choices</a>
              <a href="#section-12" className="hover:text-primary dark:hover:text-sky-400 hover:underline">12. Children's Privacy</a>
              <a href="#section-13" className="hover:text-primary dark:hover:text-sky-400 hover:underline">13. Policy Updates</a>
              <a href="#section-14" className="hover:text-primary dark:hover:text-sky-400 hover:underline">14. Contact Information</a>
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
                Elite Legal Desk ("we," "our," or "the Platform") is an enterprise-grade legal technology suite designed to streamline legal workflow collaboration, connect practicing advocates with corporate and citizen clients, provide court fee and land conversion calculation utilities, and offer digital access to verified legal resources and bare acts.
              </p>
              <p className="mt-2">
                This Privacy Policy explains how we collect, process, use, store, and safeguard personal information when you access or use Elite Legal Desk through our web application available at <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-primary dark:text-sky-400">www.elitelegaldesk.com</code> or associated domains.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section id="section-2" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">02.</span> Information We Collect
              </h2>
              <p className="mb-3">
                We collect only information that is strictly necessary to operate the platform, provide legal collaboration utilities, verify user roles, and maintain security logs.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account & Contact Information:</strong> Name, email address, mobile phone number, and security password hash (when registering via password).
                </li>
                <li>
                  <strong>Advocate Professional Credentials:</strong> Bar Council Enrollment Number, year of enrollment, primary practicing courts, specializations, professional address, experience, and bio (for advocate accounts).
                </li>
                <li>
                  <strong>Case & Collaboration Data:</strong> Case numbers, party names (plaintiff/defendant), next hearing dates, case types, task lists, document version histories, and case comments created within collaboration workspaces.
                </li>
                <li>
                  <strong>Real-time Encrypted Messages:</strong> Communication content sent between advocates and clients within the platform chat module, stored using AES-256 initialization vector encryption.
                </li>
                <li>
                  <strong>User Uploaded Files:</strong> Documents, Bare Act PDFs, and judgement files uploaded by administrators or users.
                </li>
                <li>
                  <strong>Technical & Audit Logs:</strong> IP address, user agent, login action history, and timestamp logs generated automatically during platform activity for security auditing.
                </li>
              </ul>
            </section>

            {/* 3. Google Authentication */}
            <section id="section-3" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">03.</span> Google Authentication
              </h2>
              <p>
                Elite Legal Desk offers authentication via official Google Identity Services (GIS). When you authenticate using "Continue with Google":
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Authentication is handled directly on Google's official authorization servers.</li>
                <li>We receive only the verified profile data permitted by Google, specifically your name, email address, profile picture URL, and stable Google Account Identifier (<code className="text-xs font-mono">sub</code>).</li>
                <li>We <strong>never</strong> receive, request, or store your Google account password.</li>
              </ul>
            </section>

            {/* 4. How We Use Information */}
            <section id="section-4" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">04.</span> How We Use Information
              </h2>
              <p className="mb-2">We use collected information solely for legitimate operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Creating and managing user accounts for Advocates, Clients, and Administrators.</li>
                <li>Displaying verified Advocate listings in the platform directory.</li>
                <li>Sending automated hearing date email reminders via Nodemailer SMTP.</li>
                <li>Calculating statutory court fees and land conversion valuations based on user input.</li>
                <li>Maintaining real-time encrypted messaging and collaboration workspaces.</li>
                <li>Preventing unauthorized access, security breaches, and fraudulent enrollment claims.</li>
                <li>Complying with applicable legal obligations under Indian law.</li>
              </ul>
            </section>

            {/* 5. Legal Documents and User Content */}
            <section id="section-5" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">05.</span> Legal Documents & User Content
              </h2>
              <p>
                Documents, notes, and case details submitted to project workspaces are processed strictly to deliver collaboration features. Case files uploaded to private project workspaces are accessible only to authorized team members assigned to that project and platform administrators. Bare acts and court judgements published in the public repository are accessible to all registered platform users.
              </p>
            </section>

            {/* 6. Information Sharing */}
            <section id="section-6" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">06.</span> Information Sharing
              </h2>
              <p>
                <strong>We do not sell, rent, or trade your personal information to third parties or advertisers.</strong> Information is shared only in the following limited circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Between Advocates and Clients:</strong> Information voluntarily provided in directory profiles or shared within collaborative project workspaces.</li>
                <li><strong>Essential Infrastructure Providers:</strong> Hosting and backend providers (Vercel, Render, MongoDB Atlas) that process data under strict confidentiality obligations.</li>
                <li><strong>Legal Compliance:</strong> Where required by valid legal process, court orders, or statutory mandates under Indian law.</li>
              </ul>
            </section>

            {/* 7. Data Security */}
            <section id="section-7" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">07.</span> Data Security
              </h2>
              <p>
                We implement industry-standard technical and organizational security measures, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Bcrypt cryptographic hashing for local passwords.</li>
                <li>Short-lived JSON Web Tokens (JWT) for API authorization.</li>
                <li>AES-256 initialization vector encryption for stored chat messages.</li>
                <li>HTTPS TLS transport encryption across all client-server communications.</li>
                <li>Automated audit logging of system access and security events.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                Please note that while we employ robust security controls, no internet transmission or electronic storage method can be guaranteed as 100% immune from unexpected technical failures or malicious attacks.
              </p>
            </section>

            {/* 8. Data Retention */}
            <section id="section-8" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">08.</span> Data Retention
              </h2>
              <p>
                Personal information and project data are retained for as long as your account remains active. If you request account closure or data deletion, your personal data will be removed or anonymized, except where retention is required by legal obligations, audit requirements, or dispute resolution.
              </p>
            </section>

            {/* 9. Cookies and Local Storage */}
            <section id="section-9" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">09.</span> Cookies & Local Storage
              </h2>
              <p>
                Elite Legal Desk does <strong>not</strong> use third-party tracking or advertising cookies. We utilize browser <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">localStorage</code> strictly for operational state management:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Storing your active authentication session tokens (<code className="text-xs font-mono">accessToken</code> and <code className="text-xs font-mono">refreshToken</code>).</li>
                <li>Persisting UI theme preferences (Dark Mode / Light Mode).</li>
              </ul>
            </section>

            {/* 10. Third-Party Services */}
            <section id="section-10" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">10.</span> Third-Party Services
              </h2>
              <p className="mb-2">The platform integrates with the following trusted service providers:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <strong className="text-slate-900 dark:text-white block mb-0.5">Google Identity Services</strong>
                  <span>OAuth 2.0 User Authentication</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <strong className="text-slate-900 dark:text-white block mb-0.5">MongoDB Atlas</strong>
                  <span>Cloud Database Infrastructure</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <strong className="text-slate-900 dark:text-white block mb-0.5">Nodemailer / SMTP</strong>
                  <span>Transactional Hearing Email Reminders</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <strong className="text-slate-900 dark:text-white block mb-0.5">Vercel & Render</strong>
                  <span>Frontend & API Application Hosting</span>
                </div>
              </div>
            </section>

            {/* 11. User Rights and Choices */}
            <section id="section-11" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">11.</span> User Rights & Choices
              </h2>
              <p>
                In accordance with applicable data protection laws, you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Access and view your personal information via the account Profile page.</li>
                <li>Correct or update your advocate enrollment details, specialization, and contact details.</li>
                <li>Request account closure or deletion by contacting platform administration.</li>
              </ul>
            </section>

            {/* 12. Children's Privacy */}
            <section id="section-12" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">12.</span> Children's Privacy
              </h2>
              <p>
                Elite Legal Desk is designed for legal professionals and adult citizens. The platform is not directed toward children under 18 years of age, and we do not knowingly collect personal data from minors.
              </p>
            </section>

            {/* 13. Changes to Privacy Policy */}
            <section id="section-13" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">13.</span> Changes to Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect platform enhancements or regulatory updates. Any changes will be published on this page with an updated "Last Updated" date.
              </p>
            </section>

            {/* 14. Contact Us */}
            <section id="section-14" className="scroll-mt-20 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">14.</span> Contact Information
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
                onClick={() => navigate('/terms')}
                className="text-primary dark:text-sky-400 hover:underline font-semibold"
              >
                View Terms & Conditions →
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

export default PrivacyPolicy;
