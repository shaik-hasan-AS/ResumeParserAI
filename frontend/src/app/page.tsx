"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Target, CheckCircle, Upload, Sparkles, Rocket } from 'lucide-react';
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
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">VinentoAI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-6">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6">Sign up</Button>
              </Link>
            </>
          )}
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
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight text-foreground mb-6 leading-tight">
            Unleash your potential with <br className="hidden md:block" />
            <span className="text-primary">VinentoAI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly optimize your resume for any ATS. Get hired faster with AI-powered keyword analysis, actionable feedback, and dynamic bullet rewrites.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-md border-border text-foreground hover:bg-muted transition-all bg-transparent">
                    Log In
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
          className="mt-20 w-full max-w-5xl rounded-lg border border-border shadow-2xl overflow-hidden relative bg-card"
        >
          
          {/* Top Browser Bar */}
          <div className="h-12 border-b border-border bg-muted/50 flex items-center px-4 gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto w-64 h-6 rounded-md bg-muted/50 flex items-center justify-center text-[10px] text-muted-foreground font-medium border border-border">
              vinentoai.com/dashboard
            </div>
          </div>
          
          {/* Mockup Content Layout */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 aspect-[16/10] md:aspect-[16/9]">
            {/* Left Sidebar Mock */}
            <div className="w-full md:w-1/3 h-full rounded-xl bg-muted/50 border border-border flex flex-col gap-4 p-4 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-muted rounded-full" />
                  <div className="w-32 h-2 bg-muted rounded-full" />
                </div>
              </div>
              <div className="w-full h-px bg-muted/50 my-2" />
              <div className="w-3/4 h-3 bg-muted rounded-full" />
              <div className="w-1/2 h-3 bg-muted rounded-full" />
              <div className="w-5/6 h-3 bg-muted rounded-full" />
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="h-6 bg-primary/20 rounded-full" />
                <div className="h-6 bg-muted rounded-full" />
                <div className="h-6 bg-muted rounded-full" />
              </div>
            </div>
            
            {/* Right Main Mock */}
            <div className="flex-1 h-full rounded-xl bg-muted/50 border border-border p-6 flex flex-col gap-6 shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="w-48 h-5 bg-muted rounded-full" />
                  <div className="w-64 h-3 bg-muted rounded-full" />
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <span className="text-foreground font-bold text-lg">92</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 h-10 bg-muted rounded-lg border-b-2 border-primary" />
                <div className="flex-1 h-10 bg-muted/50 rounded-lg" />
                <div className="flex-1 h-10 bg-muted/50 rounded-lg" />
              </div>
              
              <div className="flex-1 bg-muted/50 rounded-lg border border-border p-4 space-y-4">
                <div className="w-full h-12 bg-muted/50 rounded border border-border flex items-center px-4">
                  <div className="w-3/4 h-2 bg-muted-foreground/40 rounded-full" />
                </div>
                <div className="w-full h-12 bg-muted/50 rounded border border-primary/30 flex items-center px-4">
                  <div className="w-5/6 h-2 bg-primary/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div id="features" className="mt-32 w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border hover:bg-muted transition-colors shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">ATS Precision</h3>
              <p className="text-muted-foreground">Match your resume exactly to the job description keywords so you never get filtered out.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border hover:bg-muted transition-colors shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <LayoutDashboard className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Smart Dashboard</h3>
              <p className="text-muted-foreground">Track scores, manage different versions, and get a clear action plan for improvement.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border hover:bg-muted transition-colors shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Bullet Rewrites</h3>
              <p className="text-muted-foreground">AI-generated, impact-driven bullet points that highlight your exact achievements.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mt-32 w-full max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-serif">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get your resume ATS-ready in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[16.66%] right-[16.66%] h-px bg-border transform -translate-y-1/2 z-0"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">1. Upload Resume</h3>
              <p className="text-muted-foreground">Upload your existing PDF or DOCX resume. We&apos;ll instantly parse your experience and skills.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground">Specify your target role. Our AI simulates an ATS scan and grades your resume.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">3. Optimize & Apply</h3>
              <p className="text-muted-foreground">Apply our suggested AI bullet rewrites and skill additions to build the perfect resume.</p>
            </motion.div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mt-32 w-full max-w-5xl mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-serif">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm flex flex-col hover:border-primary/50 transition-all">
              <h3 className="text-xl font-bold text-foreground mb-2">Basic</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfect for trying out VinentoAI.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">$0</span>
                <span className="text-muted-foreground"> / forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" /> 1 Resume parsing per day
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" /> Basic ATS Score
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 opacity-50" /> No AI Bullet Rewrites
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-muted/50 hover:bg-muted text-foreground border border-border rounded-md h-12">Get Started</Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-card border-2 border-primary rounded-lg p-8 shadow-sm flex flex-col relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-md">POPULAR</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
              <p className="text-muted-foreground text-sm mb-6">For serious job seekers.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">$15</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" /> Unlimited resume parsing
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" /> Detailed ATS Feedback
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" /> Unlimited AI Bullet Rewrites
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="w-5 h-5 text-primary" /> Cover letter generation
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-12">Upgrade to Pro</Button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-8 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-border/50 flex items-center justify-center">
              <FileText className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">VinentoAI</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          
          <p className="text-sm text-muted-foreground">© 2026 VinentoAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
