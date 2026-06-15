import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { ArrowLeft, Users, FileText, CheckCircle2, AlertTriangle, MessageSquare, GripVertical, Plus } from 'lucide-react';

interface Application {
  application_id: string;
  resume_id: string;
  candidate_name: string;
  match_score: number;
  match_summary: string;
  status: string;
  notes: string | null;
  applied_at: string;
}

const STATUSES = [
  { id: 'pending', label: 'New / Pending', color: 'border-blue-500/30 bg-blue-500/10 text-blue-500' },
  { id: 'reviewing', label: 'Reviewing', color: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-purple-500/30 bg-purple-500/10 text-purple-500' },
  { id: 'offered', label: 'Offered', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' },
  { id: 'rejected', label: 'Rejected', color: 'border-rose-500/30 bg-rose-500/10 text-rose-500' },
];

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNoteApp, setActiveNoteApp] = useState<Application | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [id]);

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

  const updateStatus = async (appId: string, newStatus: string) => {
    // Optimistic UI update
    setApplications(apps => apps.map(app => app.application_id === appId ? { ...app, status: newStatus } : app));
    try {
      await api.put(`/api/jobs/${id}/applications/${appId}`, { status: newStatus });
    } catch (e) {
      console.error("Failed to update status", e);
      fetchApplications(); // revert
    }
  };

  const saveNotes = async () => {
    if (!activeNoteApp) return;
    setSavingNote(true);
    try {
      await api.put(`/api/jobs/${id}/applications/${activeNoteApp.application_id}`, { notes: noteText });
      setApplications(apps => apps.map(app => app.application_id === activeNoteApp.application_id ? { ...app, notes: noteText } : app));
      setActiveNoteApp(null);
    } catch (e) {
      console.error("Failed to save notes", e);
    } finally {
      setSavingNote(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans flex flex-col h-screen">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <header className="flex-none flex justify-between items-center bg-card p-4 md:p-6 shadow-sm border-b border-border z-10 relative">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/recruiter')} className="rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Applicant Tracking
            </h1>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">Drag or update status to move candidates through the pipeline.</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 z-10 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Loading pipeline...</p>
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max items-start">
            {STATUSES.map((column) => {
              const columnApps = applications.filter(app => (app.status || 'pending') === column.id);
              
              return (
                <div key={column.id} className="w-[350px] h-full flex flex-col bg-muted/20 border border-border rounded-2xl overflow-hidden shadow-sm">
                  {/* Column Header */}
                  <div className={`p-4 border-b flex items-center justify-between bg-card ${column.color.split(' ')[0]}`}>
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${column.color}`}>
                        {column.label}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Column Body */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {columnApps.length === 0 ? (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                        <span className="text-xs font-medium text-muted-foreground/50">Drop candidates here</span>
                      </div>
                    ) : (
                      columnApps.map(app => (
                        <div key={app.application_id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-all group">
                          
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-foreground text-base truncate pr-2" title={app.candidate_name}>
                              {app.candidate_name}
                            </h3>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${scoreColor(app.match_score)} shrink-0`}>
                              <span className="text-xs font-black">{app.match_score}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5 mb-4">
                            {app.match_score >= 80 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${app.match_score >= 60 ? 'text-amber-500' : 'text-rose-500'}`} />
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {app.match_summary}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-border">
                            <select 
                              className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground font-medium outline-none focus:ring-1 focus:ring-primary flex-1"
                              value={app.status || 'pending'}
                              onChange={(e) => updateStatus(app.application_id, e.target.value)}
                            >
                              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>

                            <Button 
                              variant="outline" 
                              size="icon" 
                              className={`h-7 w-7 rounded-lg border-border ${app.notes ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
                              onClick={() => {
                                setActiveNoteApp(app);
                                setNoteText(app.notes || "");
                              }}
                              title="Recruiter Notes"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-500"
                              onClick={() => window.open(`/dashboard/resume/${app.resume_id}`, '_blank')}
                              title="View Full Resume"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {activeNoteApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Notes for {activeNoteApp.candidate_name}
              </h3>
            </div>
            <div className="p-6">
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add private recruiter notes here. For example: 'Great communication skills, schedule for round 2 technical screen...'"
                className="w-full h-40 bg-muted border border-border rounded-xl p-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none resize-none custom-scrollbar"
              />
            </div>
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl" onClick={() => setActiveNoteApp(null)}>Cancel</Button>
              <Button onClick={saveNotes} disabled={savingNote} className="rounded-xl bg-primary hover:bg-primary/90 text-white">
                {savingNote ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
