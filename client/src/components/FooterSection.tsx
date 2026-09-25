import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, MapPin, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 text-xs border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
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
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mt-0.5">
                  MADANAPALLE
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              A comprehensive digital platform connecting legal services, verified advocates, bare acts, judgments, court fee tools, and case management for Madanapalle and beyond.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
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
                <Link to="/laws" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Bare Acts & Laws Library</span>
                </Link>
              </li>
              <li>
                <Link to="/judgements" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Supreme & High Court Judgments</span>
                </Link>
              </li>
              <li>
                <Link to="/section-mapping" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Legal Section Mapping (IPC / BNS)</span>
                </Link>
              </li>
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

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3.5 border-b border-slate-800 pb-2">
              Office & Contact
            </h4>
            <div className="space-y-2.5 text-slate-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Vasavi Bhavan Street, Madanapalle, Annamayya / Chittoor District, Andhra Pradesh - 517325</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-sky-400 flex-shrink-0" />
                <a href="mailto:pvprasadvmpl@gmail.com" className="hover:text-white transition-colors">
                  pvprasadvmpl@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400 flex-shrink-0" />
                <span>+91 9247253096</span>
              </div>
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
