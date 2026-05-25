"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Target, CheckCircle, Upload, Sparkles, Rocket, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans mesh-bg relative overflow-hidden bg-[#0a0a0f]">
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ResumeIQ</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/10 rounded-full px-6">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-[0_0_15px_rgba(147,51,234,0.3)]">Sign up</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-20 px-4 z-10">
        
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto px-4"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight text-white mb-6 leading-tight">
            Unleash your potential with <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">ResumeIQ</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly optimize your resume for any ATS. Get hired faster with AI-powered keyword analysis, actionable feedback, and dynamic bullet rewrites.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-full shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all">
                Start Building Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-white/20 text-zinc-300 hover:bg-white/5 hover:text-white transition-all bg-transparent backdrop-blur-sm">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
          style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-pink-500/10 pointer-events-none" />
          
          {/* Top Browser Bar */}
          <div className="h-12 border-b border-white/10 bg-black/40 flex items-center px-4 gap-2 backdrop-blur-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto w-64 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-zinc-500 font-medium border border-white/5">
              resumeiq.ai/dashboard
            </div>
          </div>
          
          {/* Mockup Content Layout */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 aspect-[16/10] md:aspect-[16/9]">
            {/* Left Sidebar Mock */}
            <div className="w-full md:w-1/3 h-full rounded-xl bg-white/5 border border-white/5 flex flex-col gap-4 p-4 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-white/20 rounded-full" />
                  <div className="w-32 h-2 bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="w-full h-px bg-white/5 my-2" />
              <div className="w-3/4 h-3 bg-white/10 rounded-full" />
              <div className="w-1/2 h-3 bg-white/10 rounded-full" />
              <div className="w-5/6 h-3 bg-white/10 rounded-full" />
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="h-6 bg-primary/20 rounded-full" />
                <div className="h-6 bg-white/10 rounded-full" />
                <div className="h-6 bg-white/10 rounded-full" />
              </div>
            </div>
            
            {/* Right Main Mock */}
            <div className="flex-1 h-full rounded-xl bg-white/5 border border-white/5 p-6 flex flex-col gap-6 shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="w-48 h-5 bg-white/20 rounded-full" />
                  <div className="w-64 h-3 bg-white/10 rounded-full" />
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                  <span className="text-white font-bold text-lg">92</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 h-10 bg-white/10 rounded-lg border-b-2 border-primary" />
                <div className="flex-1 h-10 bg-white/5 rounded-lg" />
                <div className="flex-1 h-10 bg-white/5 rounded-lg" />
              </div>
              
              <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-4 space-y-4">
                <div className="w-full h-12 bg-white/5 rounded border border-rose-500/20 flex items-center px-4">
                  <div className="w-3/4 h-2 bg-rose-500/40 rounded-full" />
                </div>
                <div className="w-full h-12 bg-white/5 rounded border border-emerald-500/20 flex items-center px-4">
                  <div className="w-5/6 h-2 bg-emerald-500/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div id="features" className="mt-32 w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">ATS Precision</h3>
              <p className="text-zinc-400">Match your resume exactly to the job description keywords so you never get filtered out.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center mb-6">
                <LayoutDashboard className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Dashboard</h3>
              <p className="text-zinc-400">Track scores, manage different versions, and get a clear action plan for improvement.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bullet Rewrites</h3>
              <p className="text-zinc-400">AI-generated, impact-driven bullet points that highlight your exact achievements.</p>
            </div>
          </div>
        {/* How It Works Section */}
        <div id="how-it-works" className="mt-32 w-full max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif">How it works</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Get your resume ATS-ready in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-primary/50 via-pink-500/50 to-primary/50 transform -translate-y-1/2 z-0"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-[#12121a] border-2 border-primary flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Upload Resume</h3>
              <p className="text-zinc-400">Upload your existing PDF or DOCX resume. We'll instantly parse your experience and skills.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-[#12121a] border-2 border-pink-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <Sparkles className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. AI Analysis</h3>
              <p className="text-zinc-400">Specify your target role. Our AI simulates an ATS scan and grades your resume.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-[#12121a] border-2 border-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Rocket className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Optimize & Apply</h3>
              <p className="text-zinc-400">Apply our suggested AI bullet rewrites and skill additions to build the perfect resume.</p>
            </motion.div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mt-32 w-full max-w-5xl mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif">Simple, transparent pricing</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#12121a] border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col hover:border-white/10 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
              <p className="text-zinc-400 text-sm mb-6">Perfect for trying out ResumeIQ.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-zinc-500"> / forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> 1 Resume parsing per day
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Basic ATS Score
                </li>
                <li className="flex items-center gap-3 text-zinc-500">
                  <CheckCircle className="w-5 h-5 opacity-50" /> No AI Bullet Rewrites
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-12">Get Started</Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-[#1a1a24] to-[#12121a] border border-primary/50 rounded-3xl p-8 shadow-[0_0_30px_rgba(147,51,234,0.15)] flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-zinc-400 text-sm mb-6">For serious job seekers.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">$15</span>
                <span className="text-zinc-500"> / month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Unlimited resume parsing
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Detailed ATS Feedback
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Unlimited AI Bullet Rewrites
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Cover letter generation
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 shadow-[0_0_20px_rgba(147,51,234,0.3)]">Upgrade to Pro</Button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 px-8 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center">
              <FileText className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-400">ResumeIQ</span>
          </div>
          
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          
          <p className="text-sm text-zinc-600">© 2026 ResumeIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
