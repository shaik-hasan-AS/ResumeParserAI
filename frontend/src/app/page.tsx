"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center mesh-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 max-w-3xl z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block px-4 py-1.5 mb-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-purple-300"
        >
          ✨ The Future of Resume Building
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4">
          Unleash your potential with <br />
          <span className="text-gradient">ResumeIQ</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl leading-relaxed">
          AI-powered resume parsing and ATS optimization platform. Get hired faster with tailored feedback and perfect formatting.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <div className="glow-effect w-full sm:w-auto">
            <Link href="/register" className="w-full">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl relative z-10 border border-white/10 shadow-2xl">
                Start Building Free
              </Button>
            </Link>
          </div>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 glass-panel border-white/10 hover:bg-white/10 rounded-xl transition-all">
              Login to Account
            </Button>
          </Link>
        </motion.div>

        {/* Dashboard Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 w-full max-w-5xl glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden aspect-[16/9] relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10" />
          {/* Top Bar Mockup */}
          <div className="h-12 border-b border-white/10 bg-black/40 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {/* Content Area Mockup */}
          <div className="p-8 flex gap-8 h-[calc(100%-3rem)]">
            <div className="w-64 h-full rounded-xl bg-white/5 border border-white/5" />
            <div className="flex-1 h-full rounded-xl bg-white/5 border border-white/5 flex flex-col gap-4 p-6">
              <div className="w-1/3 h-8 bg-white/10 rounded-lg" />
              <div className="w-full flex-1 bg-white/5 rounded-lg border border-white/5" />
            </div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
