"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { Briefcase, Plus, Users, Clock, Target } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  description: string;
  created_at: string;
  applicant_count?: number; // Might need to compute this backend-side, but let's assume we fetch it or it's zero
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [autoRejectThreshold, setAutoRejectThreshold] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/api/jobs');
      setJobs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  const handleCreateJob = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setCreating(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        title: newTitle,
        description: newDescription
      };
      if (autoRejectThreshold.trim() !== "") {
        payload.auto_reject_threshold = parseInt(autoRejectThreshold, 10);
      }
      await api.post('/api/jobs', payload);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setAutoRejectThreshold("");
      fetchJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-border mb-6">
          <button 
            className="py-2 px-4 border-b-2 border-primary text-foreground font-bold"
          >
            Job Postings
          </button>
          <button 
            onClick={() => router.push('/dashboard/recruiter/screener')} 
            className="py-2 px-4 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Quick ATS Screener
          </button>
          <button 
            onClick={() => router.push('/dashboard/battle')} 
            className="py-2 px-4 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Resume Comparison
          </button>
        </div>

        <header className="flex justify-between items-center bg-card p-6 rounded-lg shadow-sm border border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Recruiter Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Post jobs and evaluate AI-ranked candidates.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" className="rounded-md px-6 text-muted-foreground hover:bg-muted/50 hover:text-foreground" onClick={() => { localStorage.removeItem('token'); router.push('/'); }}>
              Logout
            </Button>
          </div>
        </header>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Active Job Postings</h2>
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-md h-10 px-6 font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">Create your first job listing to start receiving AI-matched candidate applications.</p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" className="rounded-md border-primary/30 text-primary hover:bg-primary/10">
              Post your first job
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} onClick={() => router.push(`/dashboard/recruiter/job/${job.id}`)} className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                    {job.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(job.created_at)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                    <Users className="w-3.5 h-3.5" /> View Candidates
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl border border-border rounded-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-bold text-foreground mb-6">Create Job Posting</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Developer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Full Job Description</label>
                  <textarea 
                    placeholder="Paste the full job description including requirements, responsibilities, etc..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none min-h-[150px] resize-y custom-scrollbar"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Auto-Reject Threshold (Optional)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="e.g. 60 (Candidates scoring below this will be marked Rejected)"
                    value={autoRejectThreshold}
                    onChange={(e) => setAutoRejectThreshold(e.target.value)}
                    className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-md">Cancel</Button>
                <Button onClick={handleCreateJob} disabled={creating || !newTitle || !newDescription} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm px-8">
                  {creating ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
