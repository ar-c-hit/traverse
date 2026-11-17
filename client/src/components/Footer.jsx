import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Globe, Shield, MessageCircle, Mail, Phone, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@traverse.com';
  const supportPhone = import.meta.env.VITE_SUPPORT_PHONE || '+1 (800) 555-0199';
  const telHref = `tel:${supportPhone.replace(/[^+\d]/g, '')}`;

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 pt-16 pb-12 border-t border-slate-800 dark:border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-ocean-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Traverse</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier social travel platform connecting adventurers traveling at the same time and providing verified real-world itineraries from those who have already completed their journey.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                Global Community Active
              </span>
              <span className="text-xs text-slate-400">100% Free for Wanderers</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Explore Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-brand-400 transition-colors">Destinations</Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-brand-400 transition-colors">Trip Planner</Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  Travel Buddies <span className="text-[10px] bg-brand-900 text-brand-300 px-1.5 py-0.2 rounded font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/socials" className="hover:text-brand-400 transition-colors">Socials & Chat Hub</Link>
              </li>
            </ul>
          </div>

          {/* Company & Support (About & Contact) */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Company & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1.5">
                  About Traverse
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1.5">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/community?tab=same_time" className="hover:text-brand-400 transition-colors">
                  Travel At Same Time
                </Link>
              </li>
              <li>
                <Link to="/explore?tab=completed" className="hover:text-brand-400 transition-colors">
                  Travel Veterans (Completed Travel Guides)
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-300 transition-colors text-amber-400 font-medium">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Emergency */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Helpline & Safety</h4>
            <p className="text-xs text-slate-400 mb-3">
              24/7 Global Traveler Safety & Community Support
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <a href={`mailto:${supportEmail}`} className="hover:text-brand-300 transition-colors">{supportEmail}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <a href={telHref} className="hover:text-brand-300 transition-colors">{supportPhone}</a>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <p className="text-xs text-brand-300 font-semibold">🔒 Verified Identity Check</p>
              <p className="text-[11px] text-slate-400 mt-1">Community profiles are moderated for traveler safety.</p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Traverse Inc. All rights reserved. Built with MERN Stack.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-300 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

