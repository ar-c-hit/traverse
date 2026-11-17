import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck,
  ChevronDown,
  Clock
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'General Question',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit inquiry');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'General Question',
        message: '',
      });
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does matching with travelers at the same time work?',
      a: 'When you create a trip with travel dates, Traverse matches you with other travelers whose destination and dates overlap. You can browse them on the Community page under "Traveling At The Same Time" and request to buddy up or chat directly.'
    },
    {
      q: 'What is the "Travel Veteran" badge for completed trips?',
      a: 'When an adventurer returns from their journey and marks the trip status as "Completed", they can submit verified advice, real expenses, and ratings. These become invaluable resources for travelers planning a future trip to the same spot.'
    },
    {
      q: 'Is Traverse free to use?',
      a: 'Yes, 100%! Trip planning, companion matching, and the live global chat room are completely free for all wanderers worldwide.'
    },
    {
      q: 'What if someone in my companion group behaves inappropriately?',
      a: 'Safety is paramount. You can flag or report any user via the contact form or directly message the moderators in chat. Our admin team monitors all reports 24/7.'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Header */}
      <section className="bg-gradient-to-b from-brand-50 to-white dark:from-slate-900/90 dark:to-slate-950 pt-16 pb-12 border-b border-slate-100 dark:border-slate-800 text-center transition-colors">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-100 dark:bg-brand-950/70 border border-brand-200/50 dark:border-brand-800/80 px-3 py-1 rounded-full">
            We Are Here For You
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Get in Touch with the Traverse Team
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Have questions about companion matching, feedback on itineraries, or partnership inquiries? Send us a note!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Send an Inquiry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Our support guides respond within 24 hours. Messages are routed directly to the Admin Dashboard.
            </p>

            {submitted ? (
              <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-900 dark:text-brand-200">Message Delivered!</h3>
                <p className="text-xs text-brand-700 dark:text-brand-300 max-w-md mx-auto">
                  Thank you for reaching out. An administrator has received your message and will reply to your email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-300 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Topic / Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      <option value="General Question">General Question</option>
                      <option value="Trip Planning Help">Trip Planning Help</option>
                      <option value="Travel Partner Issue">Travel Partner Issue</option>
                      <option value="Community Feedback">Community Feedback</option>
                      <option value="Partnership">Partnership Inquiry</option>
                      <option value="Bug Report">Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Quick summary of your request"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Tell us what you need or how we can assist your travel journey..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6 border border-slate-800">
              <h3 className="text-xl font-bold tracking-tight">Direct Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">General & Support Email</p>
                    <a href="mailto:mishraarchit142@gmail.com" className="text-sm font-bold text-white hover:text-brand-300 transition-colors">mishraarchit142@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-ocean-500/20 text-ocean-400 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">24/7 Global Helpline</p>
                    <a href="tel:+919110101228" className="text-sm font-bold text-white hover:text-brand-300 transition-colors">+91 9110101228</a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Operating Hours</p>
                    <p className="text-sm font-bold text-white">24 Hours / 7 Days a Week</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-400 leading-relaxed">
                  🛡️ Emergency assistance? If you are on an active trip and experience a medical or safety emergency, immediately contact local emergency services first.
                </p>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Frequently Asked
              </h3>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full text-left p-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          activeFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {activeFaq === idx && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Contact;

