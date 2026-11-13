import React from 'react';
import { 
  Compass, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  Globe2, 
  Sparkles, 
  CheckCircle,
  MapPin,
  Clock,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="space-y-20 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brand-50 to-white dark:from-slate-900/90 dark:to-slate-950 pt-16 pb-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 text-xs font-bold border border-brand-200/50 dark:border-brand-800/80">
            <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Our Story & Philosophy
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            We Believe No One Should Have to Explore the World Alone.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Traverse was founded on a simple observation: the best travel companion is someone heading to the same destination on the same dates, and the best advice comes from someone who just returned yesterday.
          </p>
        </div>
      </section>

      {/* The Two Problems We Solve */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why We Built Traverse
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Traditional travel platforms leave you stranded in forums or book you into rigid tourist packages. We built something different.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/70 text-brand-700 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              1. The "Traveling at the Same Time" Dilemma
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You want to visit Kyoto or trek Patagonia, but your friends are tied up with work, or you don't want to hike solo. With Traverse, you input your travel dates, and our matching algorithm instantly surfaces fellow adventurers with overlapping dates and compatible travel styles.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              2. The "Outdated Travel Guide" Trap
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Google search results are inundated with search-engine-optimized blogs from 2018 or paid tour agency advertisements. Traverse creates a verified alumni stream: travelers who have completed their trip log actual costs, honest transport advice, and secret spots.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white py-20 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border border-transparent dark:border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Principles</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Our Community Commitments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 bg-slate-800/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-700 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              01
            </div>
            <h4 className="text-lg font-bold text-white">Safety & Transparency</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              User identity checks, community feedback ratings, and transparent moderation keep our global chat and buddy requests safe and trusted.
            </p>
          </div>

          <div className="space-y-3 bg-slate-800/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-700 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-ocean-500/20 text-ocean-400 flex items-center justify-center font-bold">
              02
            </div>
            <h4 className="text-lg font-bold text-white">Unvarnished Realism</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We reward travelers who share genuine struggles, honest budget totals, and real mistakes so future wanderers have smooth journeys.
            </p>
          </div>

          <div className="space-y-3 bg-slate-800/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-700 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              03
            </div>
            <h4 className="text-lg font-bold text-white">Sustainable Wandering</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We encourage respecting indigenous cultures, supporting local mom-and-pop homestays, and leaving natural trails cleaner than we found them.
            </p>
          </div>
        </div>
      </section>

      {/* Meet The Leadership Team */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built by Seasoned Backpackers
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Our team has collectively logged over 180 countries and 1,000 mountain passes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm transition-colors">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
              alt="Archit"
              className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-brand-100 dark:ring-brand-950"
            />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Archit</h4>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Founder & Super Admin</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Solo explorer and creator of Traverse. Traveled across 48+ destinations worldwide.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm transition-colors">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
              alt="Kai Tanaka"
              className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-brand-100 dark:ring-brand-950"
            />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Kai Tanaka</h4>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Community Architect</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passionate about street food culture, digital nomad infrastructure, and rail circuits.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm transition-colors">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
              alt="Sofia Morales"
              className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-brand-100 dark:ring-brand-950"
            />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Sofia Morales</h4>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Safety & Traveler Experience</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specialized in cross-cultural diplomacy, female solo traveler safety, and eco-tourism.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center pt-8">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-500/20"
        >
          Join Our Growing Traveler Tribe
        </Link>
      </section>

    </div>
  );
};

export default About;

