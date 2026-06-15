"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { ArrowLeft, Users, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Application {
  application_id: string;
  resume_id: string;
  candidate_name: string;
  match_score: number;
  match_summary: string;
  applied_at: string;
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get(`/api/jobs/${id}/applications`);
        setApplications(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [id]);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/recruiter')} className="rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Candidate Pipeline
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Review AI-ranked applicants for this role.</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-foreground">Applicants ({applications.length})</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p>Evaluating candidate data...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 bg-muted/50 rounded-2xl border border-dashed border-border">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">No applicants yet</p>
              <p className="text-sm text-muted-foreground mt-1">Candidates will appear here once they apply.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, idx) => (
                <div key={app.application_id} className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-muted/50 transition-colors">
                  
                  {/* Rank / Score */}
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <div className="text-lg font-black text-muted-foreground/30 w-6">#{idx + 1}</div>
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 ${scoreColor(app.match_score)}`}>
                      <span className="text-lg font-bold">{app.match_score}</span>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-1 truncate">{app.candidate_name}</h3>
                    <div className="flex items-start gap-2 mt-2 bg-background p-3 rounded-xl border border-border">
                      {app.match_score >= 80 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : app.match_score >= 60 ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {app.match_summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <Button 
                      onClick={() => window.open(`/dashboard/resume/${app.resume_id}`, '_blank')}
                      variant="outline" 
                      className="border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 rounded-xl flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> View Full Resume
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
