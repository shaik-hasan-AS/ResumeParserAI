"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
}

export default function AuthForm({ initialMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await api.post('/api/auth/login', formData.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        localStorage.setItem('token', response.data.access_token);
        router.push('/dashboard');
      } else {
        await api.post('/api/auth/register', { name, email, password });
        // Auto-login after register or switch to login mode
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const loginResponse = await api.post('/api/auth/login', formData.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        localStorage.setItem('token', loginResponse.data.access_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await api.post('/api/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('token', response.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Google Auth Failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-card p-8 rounded-2xl border border-border shadow-[0_0_40px_rgba(147,51,234,0.15)] relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-foreground tracking-tight">MyAIProfile</span>
          </Link>

          {/* Tab Switcher */}
          <div className="flex relative bg-muted/50 rounded-lg p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${mode === 'register' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'}`}
            >
              Register
            </button>
            <motion.div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-muted rounded-md shadow-sm border border-border"
              initial={false}
              animate={{ left: mode === 'login' ? '4px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Auth Failed')}
            theme="filled_black"
            shape="pill"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="px-3 text-muted-foreground bg-card">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 overflow-hidden"
            >
              <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required={mode === 'register'} 
                className="bg-muted border-border text-foreground rounded-lg focus-visible:ring-primary focus-visible:border-primary h-11" 
              />
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="bg-muted border-border text-foreground rounded-lg focus-visible:ring-primary focus-visible:border-primary h-11" 
            />
          </div>
          
          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-muted border-border text-foreground rounded-lg focus-visible:ring-primary focus-visible:border-primary h-11 pr-10" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-foreground shadow-[0_0_20px_rgba(147,51,234,0.3)] h-12 text-base font-semibold rounded-lg transition-all"
            >
              {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create account')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
