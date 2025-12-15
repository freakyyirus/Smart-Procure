'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 antialiased">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-full px-2 py-1.5">
              <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700">How it Works</a>
              <a href="#pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700">Pricing</a>
              <a href="#roadmap" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700">Roadmap</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link href="/login" className="text-sm px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
                Sign Up
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-2">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 dark:text-slate-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 dark:text-slate-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">How it Works</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 dark:text-slate-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Pricing</a>
                <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 dark:text-slate-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Roadmap</a>
                <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                  <Link href="/login" className="flex-1 text-center text-sm px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                    Sign In
                  </Link>
                  <Link href="/login" className="flex-1 text-center text-sm px-4 py-2.5 bg-blue-600 text-white rounded-full font-medium">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-100/50 via-pink-50/30 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-20 lg:pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
                Replace WhatsApp
                <br />
                &amp; Excel with
                <br />
                <span className="text-blue-600">AI-Powered</span>
                <br />
                <span className="text-blue-600">Procurement</span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                Smart Procure helps Indian SMEs manage vendors, RFQs, quotes, purchase orders, and payments — all in one secure platform.
              </p>

              {/* Feature Pills - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8 max-w-lg">
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700 dark:text-slate-300">End-to-end procurement workflow</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Transparent quote comparison</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Automated payment mandates</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Audit-ready &amp; GST-friendly</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">
                  Get Started Free
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-base">
                  Book a Demo
                </a>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              {/* Floating notification */}
              <div className="absolute -top-2 right-4 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl px-4 py-3 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">PO Generated</div>
                  <div className="text-xs text-slate-500">Just now</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Mock Window Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      app.smartprocure.in
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content Preview */}
                <div className="p-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active RFQs</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending POs</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">45</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vendors</div>
                    </div>
                  </div>

                  {/* Quote Comparison Table */}
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quote Comparison</h3>
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-slate-500 dark:text-slate-400">
                          <th className="text-left font-medium pb-3">Vendor</th>
                          <th className="text-left font-medium pb-3">Unit Price</th>
                          <th className="text-left font-medium pb-3">Landed Cost</th>
                          <th className="text-left font-medium pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-t border-slate-200 dark:border-slate-600">
                          <td className="py-3 text-slate-900 dark:text-white">ABC Steel</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">₹245</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">₹268</td>
                          <td className="py-3"><span className="text-xs font-medium text-green-600 dark:text-green-400">Best</span></td>
                        </tr>
                        <tr className="border-t border-slate-200 dark:border-slate-600">
                          <td className="py-3 text-slate-900 dark:text-white">XYZ Metals</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">₹252</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">₹275</td>
                          <td className="py-3"><span className="text-xs text-slate-400">-</span></td>
                        </tr>
                        <tr className="border-t border-slate-200 dark:border-slate-600">
                          <td className="py-3 text-slate-900 dark:text-white">PQR Industries</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">₹248</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">₹280</td>
                          <td className="py-3"><span className="text-xs text-slate-400">-</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <section className="py-8 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {[
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Built for Indian SMEs' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure & Audit-Ready' },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: 'GST Compliant' },
              { icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', label: 'Manufacturing Ready' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to procure
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete procurement suite with AI assistance, built for how Indian businesses actually work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Vendor Management', desc: 'Complete vendor database with GSTIN, bank details, and performance history tracking.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'blue' },
              { title: 'RFQ Distribution', desc: 'Send RFQs to multiple vendors via email and WhatsApp in one click.', icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20', color: 'purple' },
              { title: 'Quote Comparison', desc: 'Side-by-side comparison with landed cost calculation (base + GST + freight).', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5', color: 'green' },
              { title: 'PO Generation', desc: 'Auto-generate professional purchase orders. Download as PDF and send to vendors.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'orange' },
              { title: 'Delivery Tracking', desc: 'Track delivery status from pending to delivered with complete timeline.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'cyan' },
              { title: 'Payment Mandates', desc: 'Dual-signature payment workflow with scheduled execution and audit trail.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'pink' },
            ].map((feature, i) => {
              const colors: Record<string, string> = {
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
                cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
                pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
              };
              return (
                <div key={i} className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-900/5 transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl ${colors[feature.color]} flex items-center justify-center mb-4`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== AI FEATURES ==================== */}
      <section className="py-20 lg:py-28 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Powered by AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              AI-powered procurement
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Leverage free-tier AI to automate tedious tasks and get intelligent insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'OCR Quote Extraction', desc: 'Upload vendor quotes. AI extracts items, quantities, prices automatically.' },
              { title: 'Smart Chatbot', desc: 'Ask about RFQs, quotes, vendors in plain English. Get instant answers.' },
              { title: 'Price Anomaly Detection', desc: 'Automatically flag unusual prices with AI-powered explanations.' },
              { title: 'Vendor Scoring', desc: 'AI-driven performance scores based on delivery, pricing, quality.' },
              { title: 'Vendor Recommendations', desc: 'Get smart vendor suggestions for new RFQs based on history.' },
              { title: 'Price Forecasting', desc: 'Predict future item prices based on historical trends.' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Powered by Google Gemini 1.5 Flash (free tier) — No API costs
            </p>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete procurement lifecycle. Every step tracked. Every action logged.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-16 left-[calc(8.33%+40px)] right-[calc(8.33%+40px)] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 dark:from-blue-800 dark:via-purple-800 dark:to-blue-800" />
            
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4">
              {[
                { step: '1', title: 'Add Vendors', color: 'blue' },
                { step: '2', title: 'Create RFQs', color: 'purple' },
                { step: '3', title: 'Collect Quotes', color: 'green' },
                { step: '4', title: 'Generate POs', color: 'orange' },
                { step: '5', title: 'Track Delivery', color: 'cyan' },
                { step: '6', title: 'Execute Payment', color: 'pink' },
              ].map((item, i) => {
                const colors: Record<string, string> = {
                  blue: 'from-blue-500 to-blue-600',
                  purple: 'from-purple-500 to-purple-600',
                  green: 'from-green-500 to-green-600',
                  orange: 'from-orange-500 to-orange-600',
                  cyan: 'from-cyan-500 to-cyan-600',
                  pink: 'from-pink-500 to-pink-600',
                };
                return (
                  <div key={i} className="relative text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colors[item.color]} flex items-center justify-center shadow-lg relative z-10`}>
                      <span className="text-xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Start free. Scale when you need to.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">₹0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 3 users', '50 RFQs/month', '100 vendors', 'Basic AI features', 'Email support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full text-center py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-600 rounded-2xl p-8 shadow-xl shadow-blue-600/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">Most Popular</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">₹2,999</span>
                <span className="text-blue-200">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 10 users', 'Unlimited RFQs', 'Unlimited vendors', 'All AI features', 'Priority support', 'WhatsApp notifications'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-blue-100">
                    <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full text-center py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited users', 'Dedicated instance', 'Custom integrations', 'SLA guarantee', 'On-premise option', 'Dedicated success manager'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@smartprocure.com" className="block w-full text-center py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How is this different from Tally?', a: 'Tally handles accounting after the fact. Smart Procure manages the entire procurement workflow before you need to account for it — from RFQ to payment.' },
              { q: 'Is the AI feature really free?', a: 'Yes. We use Google Gemini 1.5 Flash free tier (1,500 requests/day). For OCR, we primarily use Tesseract.js which runs locally at zero cost.' },
              { q: 'Can vendors submit quotes through the platform?', a: 'Yes. Vendors receive RFQs via email/WhatsApp and can submit quotes. You see all quotes in a comparison dashboard.' },
              { q: 'Is it GST compliant?', a: 'Yes. We track GSTIN for all vendors, calculate GST on quotes, and maintain complete audit logs for compliance.' },
              { q: 'How does the payment mandate work?', a: 'After delivery is confirmed, create a mandate specifying amount and due date. Vendor signs digitally, then company signs. Payment processes on schedule with full audit trail.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-medium text-slate-900 dark:text-white pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-600 dark:text-slate-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to streamline your procurement?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of Indian SMEs who have simplified their procurement workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-medium text-base hover:bg-blue-50 transition-colors shadow-lg">
              Get Started Free
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="mailto:sales@smartprocure.com" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-medium text-base hover:bg-white/10 transition-colors">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-semibold">Smart Procure</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm mb-4">
                Procurement automation for Indian SMEs. Replace WhatsApp chaos with structured, audit-ready workflows.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="mailto:support@smartprocure.com" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Smart Procure. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Made with ❤️ for Indian SMEs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
