"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { Briefcase, ArrowLeft, Building2, Send, CheckCircle2, Clock } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Resume {
  id: string;
  original_file_path: string;
}

export default function CandidateJobsBoard() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, resumesRes] = await Promise.all([
          api.get('/api/jobs'),
          api.get('/api/resume/') // User's resumes
        ]);
        setJobs(jobsRes.data);
        setResumes(resumesRes.data);
        if (resumesRes.data.length > 0) {
          setSelectedResume(resumesRes.data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (jobId: string) => {
    if (!selectedResume) return alert("Please upload a resume first!");
    
    setApplyingTo(jobId);
    try {
      await api.post(`/api/jobs/${jobId}/apply?resume_id=${selectedResume}`);
      setAppliedJobs(prev => new Set(prev).add(jobId));
    } catch (error: any) {
      if (error.response?.data?.detail === "Already applied to this job with this resume") {
        setAppliedJobs(prev => new Set(prev).add(jobId));
      } else {
        alert("Failed to apply: " + (error.response?.data?.detail || "Unknown error"));
      }
    } finally {
      setApplyingTo(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Job Board
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Find roles and apply with 1-click using your AI-analyzed resume.</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Loading available jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No jobs available right now</h3>
            <p className="text-muted-foreground mb-6 max-w-md">Recruiters haven't posted any jobs yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Applying with:</span>
              <select 
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="bg-muted text-foreground text-sm rounded-lg px-3 py-2 border border-border outline-none focus:ring-1 focus:ring-primary flex-1 max-w-xs"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.original_file_path.split('/').pop()}</option>
                ))}
              </select>
              {resumes.length === 0 && (
                <span className="text-sm text-rose-500">You need to upload a resume first!</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => {
                const isApplied = appliedJobs.has(job.id);
                const isApplying = applyingTo === job.id;

                return (
                  <div key={job.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(job.created_at)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{job.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                      {isApplied ? (
                        <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 w-full justify-center">
                          <CheckCircle2 className="w-4 h-4" /> Application Submitted
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleApply(job.id)} 
                          disabled={isApplying || resumes.length === 0}
                          className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm h-11 font-semibold flex items-center gap-2"
                        >
                          {isApplying ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Evaluating Match...</>
                          ) : (
                            <><Send className="w-4 h-4" /> 1-Click Apply</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
