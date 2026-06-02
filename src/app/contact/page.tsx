"use client";

import React, { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquareCode } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setOrg("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h1 className="font-outfit text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Get In Touch With{" "}
          <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Our Security Team
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Questions regarding smart contract licensing, enterprise node setups, or integration partnerships? We are here to help.
        </p>
      </section>

      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <MessageSquareCode className="h-5 w-5 text-blue-600 mr-2" />
                Partner Communications
              </h3>
              
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Email Support</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">support@pharmachain.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Phone Channel</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">+1 (800) 555-TRUST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Global Headquarters</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                    100 Blockchain Plaza, Suite 400<br />San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 rounded-2xl border border-card-border/80">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white">Message Transmitted!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Thank you. Your inquiry has been routed to our security operations center. A technical integration lead will reach out to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2.5 text-xs font-semibold text-blue-500 hover:text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white">Send Inquiry</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@hospital.org"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder="Pfizer Biotech, CVS Care, etc."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Detailed Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry or integration requirements..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Transmitting..." : "Send Secure Message"}
                    <Send className="ml-2 h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
