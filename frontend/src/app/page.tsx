"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Target, CheckCircle, Upload, Sparkles, Rocket, Flame, Swords, ArrowRight, ShieldCheck, Mail, Cpu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans relative overflow-x-hidden bg-background">
      {/* Decorative Grid and Gradient Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 blur-[120px] rounded-full z-0" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent tracking-tight">
              Vinento<span className="text-primary font-black">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground/80">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md px-5 h-10 font-medium">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-xl px-4 h-10">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md px-5 h-10 font-medium">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-16 pb-20 px-4 z-10">
        
        {/* Banner Announcement */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary mb-8"
        >
          <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">New</span>
          Introducing Roast Mode & Resume Battle Arena 🔥
        </motion.div>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.15] bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">
            Build Resumes That Beat <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Any ATS Pipeline</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly optimize your resume for recruiters and ATS systems. Get hired faster with AI matching, Simon Cowell-style roasts, and recruiter screening insights.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base h-13 px-8 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/25 transition-all">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-13 px-8 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/25 transition-all">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-13 px-8 rounded-xl border-border text-foreground hover:bg-muted/50 transition-all bg-transparent">
                    Demo Recruiter Login
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 w-full max-w-5xl rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden relative"
        >
          {/* Top Browser Bar */}
          <div className="h-12 border-b border-border/60 bg-muted/30 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto w-72 h-6 rounded-lg bg-muted/40 flex items-center justify-center text-[10px] text-muted-foreground/80 font-medium border border-border/40">
              vinentoai.com/dashboard/battle
            </div>
          </div>
          
          {/* Mockup Content Layout */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 aspect-[16/10] md:aspect-[16/9]">
            {/* Left Sidebar Mock */}
            <div className="w-full md:w-1/3 h-full rounded-2xl bg-muted/20 border border-border/40 flex flex-col gap-4 p-5 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/10">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-20 h-3 bg-foreground/20 rounded-full" />
                  <div className="w-28 h-2 bg-foreground/10 rounded-full" />
                </div>
              </div>
              <div className="w-full h-px bg-border/40 my-1" />
              <div className="w-3/4 h-3 bg-foreground/10 rounded-full" />
              <div className="w-1/2 h-3 bg-foreground/10 rounded-full" />
              <div className="w-5/6 h-3 bg-foreground/10 rounded-full" />
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="h-7 bg-primary/20 rounded-lg flex items-center justify-center text-[10px] text-primary font-semibold border border-primary/20">Active</div>
                <div className="h-7 bg-muted/40 rounded-lg border border-border/40" />
              </div>
            </div>
            
            {/* Right Main Mock */}
            <div className="flex-1 h-full rounded-2xl bg-muted/20 border border-border/40 p-6 flex flex-col gap-6 shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="w-48 h-5 bg-foreground/20 rounded-full" />
                  <div className="w-64 h-3 bg-foreground/10 rounded-full" />
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary/80 bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-foreground font-black text-lg">94</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 h-9 bg-primary/10 rounded-lg border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">ATS Summary</div>
                <div className="flex-1 h-9 bg-muted/30 rounded-lg border border-border/40" />
                <div className="flex-1 h-9 bg-muted/30 rounded-lg border border-border/40" />
              </div>
              
              <div className="flex-1 bg-card/40 rounded-xl border border-border/40 p-4 space-y-4 shadow-sm">
                <div className="w-full h-11 bg-muted/30 rounded-lg border border-border/40 flex items-center px-4 justify-between">
                  <div className="w-2/3 h-2 bg-foreground/15 rounded-full" />
                  <div className="w-8 h-2.5 bg-emerald-500/20 rounded-full" />
                </div>
                <div className="w-full h-11 bg-muted/30 rounded-lg border border-primary/20 flex items-center px-4 justify-between">
                  <div className="w-1/2 h-2 bg-primary/25 rounded-full" />
                  <div className="w-10 h-2.5 bg-primary/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div id="features" className="mt-36 w-full max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Everything You Need to Land the Role
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Equipped with smart AI features to get recruiters highlighting your candidate profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start p-8 rounded-2xl bg-card/40 border border-border/60 hover:border-primary/40 hover:bg-muted/10 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 text-violet-500 border border-violet-500/20">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">ATS Precision Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Match your resume exactly to the target job description keywords so you never get filtered out by automatic screens.</p>
            </div>
            
            <div className="flex flex-col items-start p-8 rounded-2xl bg-card/40 border border-border/60 hover:border-primary/40 hover:bg-muted/10 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500 border border-orange-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Savage Roast Mode 🔥</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Get brutally honest, section-by-section critiques of your resume with concrete improvement tips to cut the fluff.</p>
            </div>
            
            <div className="flex flex-col items-start p-8 rounded-2xl bg-card/40 border border-border/60 hover:border-primary/40 hover:bg-muted/10 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500 border border-indigo-500/20">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Resume Battle Arena ⚔️</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Compare two candidate resumes side-by-side against a job specification to find the winner verdict instantly.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mt-36 w-full max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get your resume ATS-ready in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-6">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">1. Upload Resume</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">Upload your PDF/DOCX. Our OCR scanner parses your skills and work history in seconds.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">2. Match & Roast</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">Compare against a job requirements description or run Roast Mode to get Simon Cowell critiques.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">3. Download & Win</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">Export cover letters or optimized resumes with Harvard or Executive PDF and Word DOCX templates.</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mt-36 w-full max-w-5xl mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card/50 backdrop-blur-md border border-border/80 rounded-2xl p-8 shadow-md flex flex-col hover:border-primary/40 transition-all">
              <h3 className="text-lg font-bold text-foreground mb-2">Basic</h3>
              <p className="text-muted-foreground text-xs mb-6">Perfect for trying out VinentoAI.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-foreground">$0</span>
                <span className="text-muted-foreground text-sm"> / forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" /> 1 Resume parsing per day
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" /> Basic ATS Score & Feedback
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground/60">
                  <X className="w-4.5 h-4.5 text-muted-foreground/40 shrink-0" /> No Roast Mode or Battle Arena
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-muted/65 hover:bg-muted text-foreground border border-border/80 rounded-xl h-11">Get Started</Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-card/50 backdrop-blur-md border-2 border-primary rounded-2xl p-8 shadow-lg flex flex-col relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-bl-xl uppercase tracking-wider">POPULAR</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Pro</h3>
              <p className="text-muted-foreground text-xs mb-6">For serious job seekers & recruiters.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-foreground">$15</span>
                <span className="text-muted-foreground text-sm"> / month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm">
                <li className="flex items-center gap-3 text-foreground/90">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" /> Unlimited resume parsing & OCR
                </li>
                <li className="flex items-center gap-3 text-foreground/90">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" /> Savage Roast Mode 🔥
                </li>
                <li className="flex items-center gap-3 text-foreground/90">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" /> Resume Battle Arena ⚔️
                </li>
                <li className="flex items-center gap-3 text-foreground/90">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" /> Cover letter & Email generator
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl h-11 shadow-md shadow-primary/20">Upgrade to Pro</Button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-12 px-8 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">VinentoAI</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground/80">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          
          <p className="text-sm text-muted-foreground/75">© 2026 VinentoAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
