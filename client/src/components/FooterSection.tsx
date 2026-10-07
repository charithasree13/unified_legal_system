import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ShieldCheck, Scale, Award, GraduationCap, Code } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface TeamMember {
  id: string;
  name: string;
  degree: string;
  designation: string;
  specialization: string;
  badge?: string;
  phone: string;
  phoneDisplay: string;
  email?: string;
}

const ELITE_LEGAL_DESK_TEAM: TeamMember[] = [
  {
    id: 'pv-prasad',
    name: 'Mr. P. V. Prasad',
    degree: 'B.Com., B.L.',
    designation: 'Advocate',
    specialization: 'Title Verification, Property Laws, and All Types of Civil Matters',
    badge: 'Notary and Bank Panel Advocate',
    phone: '+919247253096',
    phoneDisplay: '+91 9247253096',
    email: 'pvprasadvmpl@gmail.com',
  },
  {
    id: 'm-chaitanya-kumar',
    name: 'Mr. M. Chaitanya Kumar',
    degree: 'B.A., B.L.',
    designation: 'Advocate',
    specialization: 'Criminal Cases',
    phone: '+919440046533',
    phoneDisplay: '+91 9440046533',
    email: 'kumarchaitanya1970@gmail.com',
  },
  {
    id: 'b-sreenivasulu',
    name: 'Mr. B. Sreenivasulu',
    degree: 'B.L.',
    designation: 'Advocate',
    specialization: 'MVOP Cases',
    phone: '+919441135084',
    phoneDisplay: '+91 9441135084',
    email: 'bsreenivasadv@gmail.com',
  },
  {
    id: 'j-sailaja-naidu',
    name: 'Mrs. J. Sailaja Naidu',
    degree: 'B.Pharm., L.L.B.',
    designation: 'Advocate',
    specialization: 'Deals with All Types of Cases',
    phone: '+919959249779',
    phoneDisplay: '+91 9959249779',
    email: 'sailajaadv18@gmail.com',
  },
  {
    id: 'r-shajahan',
    name: 'Mr. R. Shajahan',
    degree: 'B.Com., B.L.',
    designation: 'Advocate',
    specialization: 'N.I. Act Cases',
    phone: '+919494740180',
    phoneDisplay: '9494740180',
  },
  {
    id: 'n-reddinagulu',
    name: 'Mr. N. Reddinagulu',
    degree: 'B.Com., B.L.',
    designation: 'Advocate',
    specialization: 'Revenue Laws',
    phone: '+919440958757',
    phoneDisplay: '9440958757',
  },
];

export const FooterSection: React.FC = () => {
  const { user } = useAuthStore();
  const isApprovedAdvocate = user?.role === 'Advocate' && (user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED');
  const canAccessConverter = user?.role === 'Admin' || isApprovedAdvocate;

  return (
    <footer className="w-full bg-slate-900 text-slate-300 text-xs border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Top Grid: Brand & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">

          {/* Brand & Platform Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Elite Legal Desk Logo"
                className="h-10 w-10 object-contain rounded-full border border-amber-400 bg-white p-0.5"
              />
              <div>
                <span className="font-extrabold text-sm tracking-wider font-sans text-white uppercase leading-none block">
                  ELITE LEGAL DESK
                </span>

              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              A comprehensive digital platform connecting legal services, verified advocates, bare acts, judgments, court fee tools, and case management for Madanapalle and beyond.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <span>Founded by <strong>Mr. P. V. Prasad</strong>, Advocate (AP/298/1998)</span>
            </div>
          </div>

          {/* Quick Legal Navigation */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5 border-b border-slate-800 pb-2">
              Legal Platform Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/directory" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Advocate Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/calculators" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Court Fee & Land Calculators</span>
                </Link>
              </li>
              <li>
                <Link to="/interest-calculator" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Interest Calculator</span>
                </Link>
              </li>
              <li>
                <Link to="/date-difference-calculator" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Date Difference Calculator</span>
                </Link>
              </li>
              <li>
                <Link to="/laws" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Bare Acts & Laws Library</span>
                </Link>
              </li>
              <li>
                <Link to="/judgements" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Supreme & High Court Judgments</span>
                </Link>
              </li>
              {canAccessConverter && (
                <li>
                  <Link to="/section-mapping" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                    <span>Old Acts → New Acts Converter</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* User & Access Portals */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5 border-b border-slate-800 pb-2">
              Access & Policy Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="#founder" className="hover:text-amber-400 transition-colors">
                  About the Founder
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">
                  Advocate / Client Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Office & Contact Details */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5 border-b border-slate-800 pb-2">
              Office & Contact
            </h4>
            <div className="space-y-2.5 text-slate-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Vasavi Bhavan Street, Madanapalle, Annamayya / Chittoor District, Andhra Pradesh - 517325</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section: ELITE LEGAL DESK TEAM */}
        <div className="pb-8 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Scale size={15} className="text-amber-400" />
              <span>ELITE LEGAL DESK TEAM</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">Legal Professionals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ELITE_LEGAL_DESK_TEAM.map((member) => (
              <div
                key={member.id}
                className="bg-slate-800/40 border border-slate-800/90 rounded-lg p-4 space-y-2.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5">
                  <div>
                    <h5 className="font-bold text-white text-sm leading-snug">
                      {member.name},{' '}
                      <span className="text-slate-300 font-normal text-xs">{member.degree}</span>
                    </h5>
                    <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span>{member.designation}</span>
                    </p>
                  </div>

                  <div className="text-slate-300 text-xs leading-relaxed">
                    <span className="text-slate-400 font-medium">Specialization:</span>{' '}
                    <span>{member.specialization}</span>
                  </div>

                  {member.badge && (
                    <div className="inline-block bg-slate-800 text-sky-400 text-[11px] px-2 py-0.5 rounded font-medium border border-slate-700/60">
                      {member.badge}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-emerald-400 flex-shrink-0" />
                    <a href={`tel:${member.phone}`} className="hover:text-white transition-colors">
                      {member.phoneDisplay}
                    </a>
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-sky-400 flex-shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:text-white transition-colors break-all">
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: WEBSITE DEVELOPING TEAM */}
        <div className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Code size={15} className="text-sky-400" />
              <span>WEBSITE DEVELOPING TEAM</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">Website Development & Technical Team</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
            {/* Developer */}
            <div className="bg-slate-800/40 border border-slate-800/90 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-1.5 mb-2">
                <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1">

                  <span>Developer</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Ms. P. Charitha Sree
                </h5>
                <p className="text-slate-300 text-xs font-medium leading-relaxed">
                  B.Tech Student, Department of Computer Science and Engineering – Artificial Intelligence
                </p>
              </div>
              <p className="text-slate-400 text-xs pt-1">
                MITS Deemed to be University, Madanapalle
              </p>
            </div>

            {/* Mentor */}
            <div className="bg-slate-800/40 border border-slate-800/90 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-1.5 mb-2">
                <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1">

                  <span>Mentor</span>
                </div>
                <h5 className="font-bold text-white text-sm">
                  Mr. P. Praneel Kumar
                </h5>
                <p className="text-slate-300 text-xs font-medium leading-relaxed">
                  Assistant Professor
                </p>
              </div>
              <p className="text-slate-400 text-xs pt-1">
                MITS Deemed to be University, Madanapalle
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Elite Legal Desk. All rights reserved. Madanapalle, Andhra Pradesh, India.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-slate-300">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <span>•</span>
            <span className="text-amber-400/90 font-semibold">Founder: Mr. P. V. Prasad, Advocate</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

