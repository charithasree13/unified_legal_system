import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ArrowUp, Mail, MapPin, CheckCircle2, Lock, FileText, Database, UserCheck, Bell, Server } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
                LEGAL TECHNOLOGY PLATFORM
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
              <Shield size={16} /> Official Platform Policy
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Privacy Policy
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span><strong>Platform:</strong> Elite Legal Desk</span>
            </div>
          </div>

          {/* Lead Introduction */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 mb-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              Elite Legal Desk respects the privacy of users and is committed to protecting the information provided through the platform. This Privacy Policy explains what information may be collected, how it is used, how it is protected, and the choices available to users.
            </p>
          </div>

          {/* Table of Contents Quick Links */}
          <div className="bg-slate-50/70 dark:bg-slate-950/50 p-4 sm:p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 mb-8 text-xs">
            <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText size={14} className="text-primary dark:text-sky-400" /> Policy Index:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <a href="#section-1" className="hover:text-primary dark:hover:text-sky-400 hover:underline">1. Scope</a>
              <a href="#section-2" className="hover:text-primary dark:hover:text-sky-400 hover:underline">2. Information We May Collect</a>
              <a href="#section-3" className="hover:text-primary dark:hover:text-sky-400 hover:underline">3. How We Use Information</a>
              <a href="#section-4" className="hover:text-primary dark:hover:text-sky-400 hover:underline">4. Advocate Verification</a>
              <a href="#section-5" className="hover:text-primary dark:hover:text-sky-400 hover:underline">5. Legal Documents and Case Information</a>
              <a href="#section-6" className="hover:text-primary dark:hover:text-sky-400 hover:underline">6. Sharing of Information</a>
              <a href="#section-7" className="hover:text-primary dark:hover:text-sky-400 hover:underline">7. Data Security</a>
              <a href="#section-8" className="hover:text-primary dark:hover:text-sky-400 hover:underline">8. Authentication and Account Security</a>
              <a href="#section-9" className="hover:text-primary dark:hover:text-sky-400 hover:underline">9. Cookies and Similar Technologies</a>
              <a href="#section-10" className="hover:text-primary dark:hover:text-sky-400 hover:underline">10. Data Retention</a>
              <a href="#section-11" className="hover:text-primary dark:hover:text-sky-400 hover:underline">11. User Rights and Choices</a>
              <a href="#section-12" className="hover:text-primary dark:hover:text-sky-400 hover:underline">12. Children's Privacy</a>
              <a href="#section-13" className="hover:text-primary dark:hover:text-sky-400 hover:underline">13. Third-Party Services and External Links</a>
              <a href="#section-14" className="hover:text-primary dark:hover:text-sky-400 hover:underline">14. Changes to This Privacy Policy</a>
              <a href="#section-15" className="hover:text-primary dark:hover:text-sky-400 hover:underline">15. Contact</a>
              <a href="#section-16" className="hover:text-primary dark:hover:text-sky-400 hover:underline">16. Important Legal Notice</a>
              <a href="#section-17" className="hover:text-primary dark:hover:text-sky-400 hover:underline">17. Acceptance</a>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">

            {/* 1. Scope */}
            <section id="section-1" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">01.</span> Scope
              </h2>
              <p>
                This Privacy Policy applies to the Elite Legal Desk web application and the services provided through the platform.
              </p>
              <p className="mt-2">
                Elite Legal Desk is designed to help users, advocates, and administrators manage legal information, advocate profiles, cases, documents, hearings, communications, and related legal-service activities.
              </p>
            </section>

            {/* 2. Information We May Collect */}
            <section id="section-2" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">02.</span> Information We May Collect
              </h2>
              <p className="mb-3">
                Depending on how the platform is used, Elite Legal Desk may collect information such as:
              </p>

              <div className="space-y-3 pl-2">
                <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-primary dark:text-sky-400" /> Account Information
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Login credentials</li>
                    <li>Account type or role</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Shield size={14} className="text-primary dark:text-sky-400" /> Advocate Information
                  </h3>
                  <p className="text-xs mb-1">For advocates using the platform, information may include:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Advocate name</li>
                    <li>Phone number</li>
                    <li>Email address</li>
                    <li>Enrollment number</li>
                    <li>Enrollment date</li>
                    <li>Area of specialization</li>
                    <li>Practicing court</li>
                    <li>City or jurisdiction</li>
                    <li>Other professional information submitted for verification</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <FileText size={14} className="text-primary dark:text-sky-400" /> Case and Legal Information
                  </h3>
                  <p className="text-xs mb-1">Users and advocates may provide information relating to:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Case details</li>
                    <li>Case status</li>
                    <li>Hearing dates</li>
                    <li>Court information</li>
                    <li>Legal sections</li>
                    <li>Judgments and legal references</li>
                    <li>Case-related notes</li>
                    <li>Documents uploaded to the platform</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Bell size={14} className="text-primary dark:text-sky-400" /> Communication Information
                  </h3>
                  <p className="text-xs">
                    Information submitted through contact forms, notifications, or communications within the platform may be processed to provide the requested service.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Database size={14} className="text-primary dark:text-sky-400" /> Technical Information
                  </h3>
                  <p className="text-xs">
                    The application may process technical information necessary to operate, secure, troubleshoot, and improve the service, such as browser information, device information, IP address, access logs, and application activity.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. How We Use Information */}
            <section id="section-3" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">03.</span> How We Use Information
              </h2>
              <p className="mb-2">Information may be used to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Create and manage user accounts.</li>
                <li>Authenticate users and maintain account security.</li>
                <li>Provide advocate-related services and directories.</li>
                <li>Facilitate legal case and case-status management.</li>
                <li>Manage hearing dates and reminders.</li>
                <li>Store and manage documents submitted by authorized users.</li>
                <li>Provide legal information and related platform functionality.</li>
                <li>Process requests submitted through the platform.</li>
                <li>Send service-related notifications and reminders.</li>
                <li>Maintain and improve the functionality, reliability, and security of the platform.</li>
                <li>Detect, investigate, and prevent unauthorized access or misuse.</li>
                <li>Comply with applicable legal obligations where required.</li>
              </ul>
            </section>

            {/* 4. Advocate Verification */}
            <section id="section-4" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">04.</span> Advocate Verification
              </h2>
              <p>
                Where advocate verification is provided, information submitted for verification may be used to confirm professional details and maintain the reliability of advocate information displayed through the platform.
              </p>
              <p className="mt-2">
                Users should provide accurate and current information when submitting professional or verification details.
              </p>
            </section>

            {/* 5. Legal Documents and Case Information */}
            <section id="section-5" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">05.</span> Legal Documents and Case Information
              </h2>
              <p>
                Elite Legal Desk may allow authorized users to upload, store, access, or manage legal documents and case-related information.
              </p>
              <p className="mt-2">
                Users should only upload information that they are authorized to provide and manage.
              </p>
              <p className="mt-2">
                Because legal documents may contain confidential or sensitive information, users should carefully consider the information included in documents before uploading them.
              </p>
            </section>

            {/* 6. Sharing of Information */}
            <section id="section-6" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">06.</span> Sharing of Information
              </h2>
              <p>
                Elite Legal Desk does not intend to sell users' personal information.
              </p>
              <p className="mt-2">Information may be shared or disclosed only when necessary to:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Provide a requested platform service.</li>
                <li>Facilitate functionality between authorized users.</li>
                <li>Operate and maintain the platform.</li>
                <li>Use service providers required to operate the application (such as database hosting via MongoDB Atlas, cloud deployment via Vercel and Render, Google authentication, or Nodemailer/SMTP email notification providers integrated into the application).</li>
                <li>Protect the security and integrity of the platform.</li>
                <li>Comply with applicable law, legal processes, or lawful requests.</li>
                <li>Prevent fraud, abuse, unauthorized access, or other security incidents.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                The application should not disclose information to unrelated third parties merely for advertising or marketing purposes unless the applicable privacy notice is updated accordingly.
              </p>
            </section>

            {/* 7. Data Security */}
            <section id="section-7" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">07.</span> Data Security
              </h2>
              <p>
                Elite Legal Desk uses reasonable technical and organizational measures intended to protect information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="mt-2">
                Access to information should be limited according to the user's role and the functionality provided by the application.
              </p>
            </section>

            {/* 8. Authentication and Account Security */}
            <section id="section-8" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">08.</span> Authentication and Account Security
              </h2>
              <p>
                Users are responsible for maintaining the confidentiality of their account credentials and for using the platform through authorized accounts.
              </p>
              <p className="mt-2">
                Where authentication features such as email verification, OTP authentication, Google authentication, or password-based authentication are implemented, the application may process the information necessary to provide those authentication services.
              </p>
            </section>

            {/* 9. Cookies and Similar Technologies */}
            <section id="section-9" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">09.</span> Cookies and Similar Technologies
              </h2>
              <p>
                The application may use cookies, local storage, session storage, or similar technologies where necessary for authentication, session management, preferences, security, or application functionality.
              </p>
            </section>

            {/* 10. Data Retention */}
            <section id="section-10" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">10.</span> Data Retention
              </h2>
              <p>
                Information may be retained for as long as reasonably necessary to provide the requested services, maintain account and application functionality, comply with applicable legal requirements, resolve disputes, maintain security, or fulfill legitimate operational requirements.
              </p>
            </section>

            {/* 11. User Rights and Choices */}
            <section id="section-11" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">11.</span> User Rights and Choices
              </h2>
              <p>
                Subject to applicable law and the functionality available in the platform, users may have rights or choices regarding their personal information, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Requesting access to personal information associated with their account.</li>
                <li>Requesting correction of inaccurate information.</li>
                <li>Requesting deletion of information where applicable.</li>
                <li>Requesting clarification regarding the processing of personal information.</li>
                <li>Withdrawing consent where processing is based on consent, subject to applicable limitations.</li>
                <li>Managing account information through available account settings.</li>
              </ul>
            </section>

            {/* 12. Children's Privacy */}
            <section id="section-12" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">12.</span> Children's Privacy
              </h2>
              <p>
                Elite Legal Desk is not intended to knowingly collect personal information from children without appropriate authorization.
              </p>
              <p className="mt-2">
                If information relating to a child is provided to the platform, it should be handled in accordance with applicable laws and requirements.
              </p>
            </section>

            {/* 13. Third-Party Services and External Links */}
            <section id="section-13" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">13.</span> Third-Party Services and External Links
              </h2>
              <p>
                Elite Legal Desk may contain links to external websites, legal resources, government resources, or third-party services (such as Google Identity Services for authentication, Nodemailer/SMTP for hearing email reminders, and MongoDB Atlas / cloud hosting infrastructure).
              </p>
              <p className="mt-2">
                External websites operate under their own privacy policies and terms. Elite Legal Desk is not responsible for the privacy practices of websites or services that it does not control.
              </p>
            </section>

            {/* 14. Changes to This Privacy Policy */}
            <section id="section-14" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">14.</span> Changes to This Privacy Policy
              </h2>
              <p>
                This Privacy Policy may be updated when the platform's functionality, data-processing practices, or applicable requirements change.
              </p>
              <p className="mt-2">
                When significant changes are made, the updated version should be published through the platform and the "Last Updated" date should be changed accordingly.
              </p>
            </section>

            {/* 15. Contact */}
            <section id="section-15" className="scroll-mt-20 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">15.</span> Contact
              </h2>
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Elite Legal Desk Support
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  For privacy-related questions or requests, users should contact the official Elite Legal Desk support channel provided within the application or via our platform email: <a href="mailto:elitelegaldeskmpl@gmail.com" className="text-primary dark:text-sky-400 font-semibold hover:underline">elitelegaldeskmpl@gmail.com</a>.
                </p>
              </div>
            </section>

            {/* 16. Important Legal Notice */}
            <section id="section-16" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">16.</span> Important Legal Notice
              </h2>
              <p>
                Elite Legal Desk is a technology platform intended to support legal information management and related workflows.
              </p>
              <p className="mt-2">
                The availability of legal information, case information, legal sections, judgments, calculations, or other resources through the platform does not by itself constitute legal advice or create an advocate-client relationship.
              </p>
              <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                Users should consult a qualified legal professional for advice relating to their individual circumstances.
              </p>
            </section>

            {/* 17. Acceptance */}
            <section id="section-17" className="scroll-mt-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-primary dark:text-sky-400 font-mono text-base">17.</span> Acceptance
              </h2>
              <p>
                By using Elite Legal Desk, users acknowledge that they have had an opportunity to review this Privacy Policy and understand that the policy may be updated from time to time.
              </p>
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
