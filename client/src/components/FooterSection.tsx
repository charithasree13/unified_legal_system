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
  {
    id: 'cvln-murthy',
    name: 'Mr. CVLN Murthy',
    degree: 'B.A., L.L.B.',
    designation: 'Advocate, High Court of Telangana, Hyderabad',
    specialization: 'Digital Evidence, Cyber Laws',
    phone: '+919848055798',
    phoneDisplay: '+91 98480 55798',
    email: 'cvlnassociates@gmail.com',
  },
];

export const FooterSection: React.FC = () => {
  const { user } = useAuthStore();
  const isApprovedAdvocate = user?.role === 'Advocate' && (user?.isVerified === true || (user as any)?.verificationStatus === 'APPROVED');
  const canAccessConverter = user?.role === 'Admin' || isApprovedAdvocate;

  return (
    <footer className="w-full bg-[#171916] text-[#C5C0B6] text-xs border-t border-[#30352F] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Top Grid: Brand & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[#30352F]">

          {/* Brand & Platform Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Elite Legal Desk Logo"
                className="h-10 w-10 object-contain rounded-full border border-[#C7A45A] bg-[#FFFDF8] p-0.5"
              />
              <div>
                <span className="font-extrabold text-sm tracking-wider font-sans text-[#F4F0E7] uppercase leading-none block">
                  ELITE LEGAL DESK
                </span>

              </div>
            </div>
            <p className="text-[#C5C0B6] text-xs leading-relaxed">
              A comprehensive digital platform connecting legal services, verified advocates, bare acts, judgments, court fee tools, and case management for Madanapalle and beyond.
            </p>
            <div className="pt-2 text-[11px] text-[#C5C0B6] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#6F9A83] flex-shrink-0" />
              <span>Founded by <strong>Mr. P. V. Prasad</strong>, Advocate (AP/298/1998)</span>
            </div>
          </div>

          {/* Quick Legal Navigation */}
          <div>
            <h4 className="font-bold text-[#F4F0E7] text-xs uppercase tracking-wider mb-3.5 border-b border-[#30352F] pb-2">
              Legal Platform Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/directory" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                  <span>Advocate Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/calculators" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                  <span>Court Fee & Land Calculators</span>
                </Link>
              </li>
              <li>
                <Link to="/interest-calculator" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                  <span>Interest Calculator</span>
                </Link>
              </li>
              <li>
                <Link to="/date-difference-calculator" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                  <span>Date Difference Calculator</span>
                </Link>
              </li>
              <li>
                <Link to="/laws" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                  <span>Bare Acts & Laws Library</span>
                </Link>
              </li>
              <li>
                <Link to="/judgements" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                  <span>Supreme & High Court Judgments</span>
                </Link>
              </li>
              {canAccessConverter && (
                <li>
                  <Link to="/section-mapping" className="hover:text-[#C7A45A] transition-colors flex items-center gap-1">
                    <span>Old Acts → New Acts Converter</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* User & Access Portals */}
          <div>
            <h4 className="font-bold text-[#F4F0E7] text-xs uppercase tracking-wider mb-3.5 border-b border-[#30352F] pb-2">
              Access & Policy Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#C7A45A] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#C7A45A] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="#founder" className="hover:text-[#C7A45A] transition-colors">
                  About the Founder
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#C7A45A] transition-colors">
                  Advocate / Client Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Office & Contact Details */}
          <div>
            <h4 className="font-bold text-[#F4F0E7] text-xs uppercase tracking-wider mb-3.5 border-b border-[#30352F] pb-2">
              Office & Contact
            </h4>
            <div className="space-y-2.5 text-[#C5C0B6] text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#C7A45A] flex-shrink-0 mt-0.5" />
                <span>Vasavi Bhavan Street, Madanapalle, Annamayya / Chittoor District, Andhra Pradesh - 517325</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section: ELITE LEGAL DESK TEAM */}
        <div className="pb-8 border-b border-[#30352F]">
          <div className="flex items-center justify-between mb-6 border-b border-[#30352F] pb-2.5">
            <h4 className="font-bold text-[#F4F0E7] text-xs uppercase tracking-wider flex items-center gap-2">
              <Scale size={15} className="text-[#C7A45A]" />
              <span>ELITE LEGAL DESK TEAM</span>
            </h4>
            <span className="text-[11px] text-[#969188] font-medium">Legal Professionals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ELITE_LEGAL_DESK_TEAM.map((member) => (
              <div
                key={member.id}
                className="bg-[#242822] border border-[#3A4038] rounded-lg p-4 space-y-2.5 flex flex-col justify-between hover:border-[#6F9A83] transition-colors"
              >
                <div className="space-y-1.5">
                  <div>
                    <h5 className="font-bold text-[#F4F0E7] text-sm leading-snug">
                      {member.name},{' '}
                      <span className="text-[#C5C0B6] font-normal text-xs">{member.degree}</span>
                    </h5>
                    <p className="text-[#C7A45A] text-xs font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span>{member.designation}</span>
                    </p>
                  </div>

                  <div className="text-[#C5C0B6] text-xs leading-relaxed">
                    <span className="text-[#969188] font-medium">Specialization:</span>{' '}
                    <span>{member.specialization}</span>
                  </div>

                  {member.badge && (
                    <div className="inline-block bg-[#1F3327] text-[#7CB895] text-[11px] px-2 py-0.5 rounded font-medium border border-[#3A4038]">
                      {member.badge}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#30352F] space-y-1.5 text-xs text-[#C5C0B6]">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#6F9A83] flex-shrink-0" />
                    <a href={`tel:${member.phone}`} className="hover:text-[#F4F0E7] transition-colors">
                      {member.phoneDisplay}
                    </a>
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-[#8FAF9C] flex-shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:text-[#F4F0E7] transition-colors break-all">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#30352F] pb-2">
            <h4 className="font-bold text-[#F4F0E7] text-xs uppercase tracking-wider flex items-center gap-2">
              <Code size={15} className="text-[#6F9A83]" />
              <span>WEBSITE DEVELOPING TEAM</span>
            </h4>
            <span className="text-[11px] text-[#969188] font-medium">Website Development & Technical Team</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
            {/* Developer */}
            <div className="bg-[#242822] border border-[#3A4038] rounded-lg p-4 flex flex-col justify-between hover:border-[#6F9A83] transition-colors">
              <div className="space-y-1.5 mb-2">
                <div className="text-[10px] text-[#C7A45A] uppercase tracking-widest font-bold flex items-center gap-1">

                  <span>Developer</span>
                </div>
                <h5 className="font-bold text-[#F4F0E7] text-sm">
                  Ms. P. Charitha Sree
                </h5>
                <p className="text-[#C5C0B6] text-xs font-medium leading-relaxed">
                  B.Tech Student, Department of Computer Science and Engineering – Artificial Intelligence
                </p>
              </div>
              <p className="text-[#969188] text-xs pt-1">
                MITS Deemed to be University, Madanapalle
              </p>
            </div>

            {/* Mentor */}
            <div className="bg-[#242822] border border-[#3A4038] rounded-lg p-4 flex flex-col justify-between hover:border-[#6F9A83] transition-colors">
              <div className="space-y-1.5 mb-2">
                <div className="text-[10px] text-[#C7A45A] uppercase tracking-widest font-bold flex items-center gap-1">

                  <span>Mentor</span>
                </div>
                <h5 className="font-bold text-[#F4F0E7] text-sm">
                  Mr. P. Praneel Kumar
                </h5>
                <p className="text-[#C5C0B6] text-xs font-medium leading-relaxed">
                  Assistant Professor
                </p>
              </div>
              <p className="text-[#969188] text-xs pt-1">
                MITS Deemed to be University, Madanapalle
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 border-t border-[#30352F] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#969188]">
          <p>© {new Date().getFullYear()} Elite Legal Desk. All rights reserved. Madanapalle, Andhra Pradesh, India.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-[#F4F0E7]">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#F4F0E7]">Terms</Link>
            <span>•</span>
            <span className="text-[#C7A45A] font-semibold">Founder: Mr. P. V. Prasad, Advocate</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

