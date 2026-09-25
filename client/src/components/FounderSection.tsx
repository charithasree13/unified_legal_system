import React from 'react';
import { Scale, Award, MapPin, Mail, Phone, ShieldCheck, CheckCircle2, Landmark, BookOpen } from 'lucide-react';

export const FounderSection: React.FC = () => {
  return (
    <section id="founder" className="w-full bg-white dark:bg-slate-900 border-t border-b border-slate-200/80 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 my-8 shadow-sm">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-3">
            <Scale size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Leadership & Platform Vision</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight">
            About the Founder
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
            Elite Legal Desk was established under experienced legal leadership to bridge digital technology with practical courtroom practice and legal administration in Madanapalle.
          </p>
        </div>

        {/* Founder Detail Card */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">

          {/* Subtle Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-amber-500 to-primary" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Founder Profile Badge & Photo Column */}
            <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">

              <div className="relative mb-4">
                <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-white dark:bg-slate-900 border-4 border-amber-400 shadow-xl p-1.5 flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.jpg"
                    alt="Mr. P. V. Prasad, Advocate"
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-900" title="Verified Senior Legal Advocate">
                  <ShieldCheck size={18} />
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-wide">
                Mr. P. V. Prasad
              </h3>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-1">
                Advocate & Notary Public
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Founder, Elite Legal Desk
              </p>

              {/* Bar Enrollment Badge */}
              <div className="mt-4 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-left space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Bar Enrollment:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">AP / 298 / 1998</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Experience:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">28+ Years Practice</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400">
                    <CheckCircle2 size={12} /> Active Practitioner
                  </span>
                </div>
              </div>

            </div>

            {/* Founder Biography & Practice Areas Column */}
            <div className="lg:col-span-8 space-y-5">

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  Legal Background & Professional Overview
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Mr. P. V. Prasad is a distinguished practicing advocate and appointed Notary Public based in Madanapalle, Andhra Pradesh. Enrolled with the Bar Council of Andhra Pradesh in 1998.
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Envisioning an integrated digital portal for local advocates, litigants, and legal researchers, Mr. Prasad founded <strong>Elite Legal Desk</strong> to streamline court fee calculations, legal section cross-mapping, case file collaboration, and verified advocate discovery.
                </p>
              </div>

              {/* Core Practice Areas & Courts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                    <Landmark size={16} className="text-primary dark:text-sky-400" />
                    <span>Court Practice Locations</span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Senior Civil Judge's Court, Madanapalle</li>
                    <li>• Junior Civil Judge's Court, Madanapalle</li>
                    <li>• Judicial Magistrate of 1st Class, Madanapalle</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                    <BookOpen size={16} className="text-amber-500" />
                    <span>Specializations & Services</span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Civil Litigation & Property Suits</li>
                    <li>• Notary Public Statutory Attestation</li>
                    <li>• Bank Legal Panel Advice & Title Verification</li>
                  </ul>
                </div>

              </div>

              {/* Contact Information Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-amber-500" />
                  <span>Vasavi Bhavan Street, Madanapalle, Andhra Pradesh, India</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-sky-500" />
                  <a href="mailto:pvprasadvmpl@gmail.com" className="hover:text-primary dark:hover:text-sky-400 hover:underline">
                    pvprasadvmpl@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-500" />
                  <span>+91 9247253096</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
