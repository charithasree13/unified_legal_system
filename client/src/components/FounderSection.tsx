import React from 'react';
import { Scale, Award, MapPin, Mail, Phone, ShieldCheck, CheckCircle2, Landmark, BookOpen, Sparkles } from 'lucide-react';

export const FounderSection: React.FC = () => {
  return (
    <section id="founder" className="w-full bg-[#FFFDF8] dark:bg-[#171916] border-t border-b border-[#D8D1C5] dark:border-[#30352F] py-12 px-4 sm:px-6 lg:px-8 my-8 shadow-xs">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1E9D8] dark:bg-[#332A19] text-[#80632E] dark:text-[#D8C49A] border border-[#D8D1C5] dark:border-[#3A4038] text-xs font-bold uppercase tracking-wider mb-3">
            <Scale size={14} className="text-[#A67C3B] dark:text-[#C7A45A]" />
            <span>Leadership & Platform Vision</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-[#242522] dark:text-[#F4F0E7] tracking-tight">
            About the Founder
          </h2>
          <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs sm:text-sm mt-2 leading-relaxed">
            Elite Legal Desk was established under experienced legal leadership to bridge digital technology with practical courtroom practice and legal administration.
          </p>
        </div>

        {/* Founder Detail Card */}
        <div className="bg-[#EFEAE0]/50 dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">

          {/* Subtle Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#183C32] via-[#A67C3B] to-[#183C32] dark:from-[#6F9A83] dark:via-[#C7A45A] dark:to-[#6F9A83]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Founder Profile Badge & Photo Column */}
            <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-[#D8D1C5] dark:border-[#30352F] pb-6 lg:pb-0 lg:pr-8">

              <div className="relative mb-4">
                <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-[#FFFDF8] dark:bg-[#242822] border-4 border-[#A67C3B] dark:border-[#C7A45A] shadow-md p-1.5 flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.jpg"
                    alt="Mr. P. V. Prasad, Advocate"
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute bottom-1 right-1 bg-[#183C32] text-white p-1.5 rounded-full shadow-md border-2 border-[#FFFDF8] dark:border-[#242822]" title="Verified Senior Legal Advocate">
                  <ShieldCheck size={18} />
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#242522] dark:text-[#F4F0E7] tracking-wide">
                Mr. P. V. Prasad
              </h3>
              <p className="text-xs font-bold text-[#A67C3B] dark:text-[#C7A45A] uppercase tracking-widest mt-1">
                Advocate, Notary & Legal Advisor
              </p>
              <p className="text-xs text-[#858078] dark:text-[#969188] font-semibold mt-0.5">
                Founder, Elite Legal Desk
              </p>

              {/* Bar Enrollment Badge */}
              <div className="mt-4 w-full bg-[#FFFDF8] dark:bg-[#242822] border border-[#D8D1C5] dark:border-[#3A4038] rounded-xl p-3 text-left space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#858078] dark:text-[#969188]">Bar Enrollment:</span>
                  <span className="font-bold text-[#242522] dark:text-[#F4F0E7]">AP / 298 / 1998</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#858078] dark:text-[#969188]">Experience:</span>
                  <span className="font-bold text-[#3F6B50] dark:text-[#7CB895]">28+ Years Practice</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#858078] dark:text-[#969188]">Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#183C32] dark:text-[#6F9A83]">
                    <CheckCircle2 size={12} /> Active Practitioner
                  </span>
                </div>
              </div>

            </div>

            {/* Founder Biography & Practice Areas Column */}
            <div className="lg:col-span-8 space-y-5">

              <div className="space-y-2">
                <h4 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7] flex items-center gap-2">
                  <Award size={18} className="text-[#A67C3B] dark:text-[#C7A45A]" />
                  Legal Background & Professional Overview
                </h4>
                <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs sm:text-sm leading-relaxed">
                  Mr. P. V. Prasad is a distinguished practicing advocate enrolled in State Bar Council of Andhra Pradesh in the year 1998 and appointed as Notary Public by Govt. of Andhra Pradesh in the year 2011 and appointed as Bank Panel Advocate for Nationalized Banks. He worked as a junior Advocate under the supervision of Mr. T. Janardhan Gupta, Advocate, Ex. Public Prosecutor, Madanapalle.
                </p>

                {/* Respectful Memorial & Mentorship Tribute for late Sri T. Janardhana Gupta */}
                <div className="my-3.5 p-4 sm:p-5 bg-[#FFFDF8] dark:bg-[#242822] border border-[#D8D1C5] dark:border-[#3A4038] rounded-2xl shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">

                    {/* Dedicated Portrait Area */}
                    <div className="shrink-0 flex flex-col items-center text-center">
                      <div className="relative group">
                        <div className="h-32 w-28 sm:h-36 sm:w-30 rounded-xl bg-[#FFFDF8] dark:bg-[#171916] border-2 border-[#A67C3B] dark:border-[#C7A45A] p-1 shadow-md overflow-hidden">
                          <img
                            src="/janardhana-gupta-memorial.jpg"
                            alt="Portrait of Sri T. Janardhana Gupta, B.A., B.L., remembered as a legal mentor"
                            className="h-full w-full object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <span className="mt-2 text-[9px] font-extrabold uppercase tracking-wider text-[#A67C3B] dark:text-[#C7A45A] bg-[#F1E9D8] dark:bg-[#332A19] px-2 py-0.5 rounded-full border border-[#D8D1C5] dark:border-[#3A4038]">
                        Senior Advocate
                      </span>
                    </div>

                    {/* Memorial Information & Mentorship Tribute */}
                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1E9D8] dark:bg-[#332A19] text-[#80632E] dark:text-[#D8C49A] border border-[#D8D1C5] dark:border-[#3A4038] text-[10px] font-extrabold uppercase tracking-widest">
                        <Sparkles size={11} className="text-[#A67C3B] dark:text-[#C7A45A]" />
                        In Remembrance Of
                      </div>

                      <h5 className="text-base sm:text-lg font-extrabold text-[#242522] dark:text-[#F4F0E7] font-sans tracking-tight">
                        Sri T. Janardhana Gupta, <span className="text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6] font-sans">B.A., B.L.</span>
                      </h5>

                      <p className="text-[11px] font-extrabold text-[#A67C3B] dark:text-[#C7A45A] tracking-wider">
                        23 August 1940 – 23 May 2006 | Ex. Public Prosecutor, Madanapalle
                      </p>

                      <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] leading-relaxed pt-1 font-normal">
                        Remembered with profound respect and gratitude as a distinguished legal professional and mentor. His guidance, legal experience, and courtroom wisdom formed an important part of the professional journey.
                      </p>
                    </div>

                  </div>
                </div>

                <p className="text-[#625F58] dark:text-[#C5C0B6] text-xs sm:text-sm leading-relaxed">
                  Envisioning an integrated digital portal for advocates, litigants, and legal researchers, Mr. Prasad founded <strong>Elite Legal Desk</strong> to streamline court fee calculations, legal section cross-mapping, case file collaboration, and verified advocate discovery.
                </p>
              </div>

              {/* Core Practice Areas & Courts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">

                <div className="bg-[#FFFDF8] dark:bg-[#242822] p-3.5 rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-2">
                    <Landmark size={16} className="text-[#183C32] dark:text-[#6F9A83]" />
                    <span>Court Practice Locations</span>
                  </div>
                  <ul className="text-xs text-[#625F58] dark:text-[#C5C0B6] space-y-1">
                    <li>• Senior Civil Judge's Court, Madanapalle</li>
                    <li>• Junior Civil Judge's Court, Madanapalle</li>
                    <li>• Judicial Magistrate of 1st Class, Madanapalle</li>
                  </ul>
                </div>

                <div className="bg-[#FFFDF8] dark:bg-[#242822] p-3.5 rounded-xl border border-[#D8D1C5] dark:border-[#3A4038]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#242522] dark:text-[#F4F0E7] mb-2">
                    <BookOpen size={16} className="text-[#A67C3B] dark:text-[#C7A45A]" />
                    <span>Specializations & Services</span>
                  </div>
                  <ul className="text-xs text-[#625F58] dark:text-[#C5C0B6] space-y-1">
                    <li>• Civil Litigation & Property Suits</li>
                    <li>• Notary Public Statutory Attestation</li>
                    <li>• Bank Legal Panel Advice & Title Verification</li>
                  </ul>
                </div>

              </div>

              {/* Contact Information Bar */}
              <div className="pt-3 border-t border-[#D8D1C5] dark:border-[#30352F] flex flex-wrap gap-4 text-xs font-medium text-[#625F58] dark:text-[#C5C0B6]">
                <div className="flex items-start gap-1.5">
                  <MapPin size={14} className="text-[#A67C3B] shrink-0 mt-0.5" />
                  <div className="flex flex-col space-y-0.5">
                    <span>Vasavi Bhavan Street, Madanapalle, Andhra Pradesh, India</span>
                    <span>Eswaramma Colony Extension, Chembakur Road, Madanapalle, Andhra Pradesh, India</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#71877B] shrink-0" />
                  <a href="mailto:pvprasadvmpl@gmail.com" className="hover:text-[#183C32] dark:hover:text-[#F4F0E7] hover:underline">
                    pvprasadvmpl@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[#3F6B50] shrink-0" />
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
