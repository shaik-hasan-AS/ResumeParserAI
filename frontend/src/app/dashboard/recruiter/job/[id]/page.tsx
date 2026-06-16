"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { ArrowLeft, Users, FileText, CheckCircle2, AlertTriangle, MessageSquare, GripVertical, Plus, UploadCloud, X, Search } from 'lucide-react';

interface Application {
  application_id: string;
  resume_id: string;
  candidate_name: string;
  match_score: number;
  match_summary: string;
  status: string;
  notes: string | null;
  rating: number | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNoteApp, setActiveNoteApp] = useState<Application | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(`Uploading and analyzing ${e.target.files.length} resumes... This might take a minute.`);
    
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.post(`/api/jobs/${id}/upload_candidates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadModalOpen(false);
      fetchApplications(); // Refresh board
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload resumes. Ensure they are PDFs.");
    } finally {
      setUploading(false);
      setUploadProgress("");
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

  const updateRating = async (appId: string, rating: number) => {
    setApplications(apps => apps.map(app => app.application_id === appId ? { ...app, rating } : app));
    try {
      await api.put(`/api/jobs/${id}/applications/${appId}`, { rating });
    } catch (e) {
      console.error("Failed to update rating", e);
      fetchApplications();
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return app.candidate_name.toLowerCase().includes(q) || 
           (app.match_summary && app.match_summary.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans flex flex-col h-screen">
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
        
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search candidates by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center gap-2 text-sm"
          >
            <UploadCloud className="w-4 h-4" /> Bulk Upload PDFs
          </Button>
          <ThemeToggle />
        </div>
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
              const columnApps = filteredApplications.filter(app => (app.status || 'pending') === column.id);
              
              return (
                <div key={column.id} className="w-[350px] h-full flex flex-col bg-muted/20 border border-border rounded-lg overflow-hidden shadow-sm">
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
                        <span className="text-xs font-medium text-muted-foreground/50">No candidates</span>
                      </div>
                    ) : (
                      columnApps.map(app => (
                        <div key={app.application_id} className="bg-card border border-border rounded-md p-4 shadow-sm hover:border-primary/50 transition-all group flex flex-col gap-3">
                          
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-foreground text-base truncate pr-2" title={app.candidate_name}>
                              {app.candidate_name}
                            </h3>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${scoreColor(app.match_score)} shrink-0`}>
                              <span className="text-xs font-black">{app.match_score}</span>
                            </div>
                          </div>
                          
                          {/* Star Rating */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star}
                                onClick={() => updateRating(app.application_id, star === app.rating ? 0 : star)}
                                className={`text-lg leading-none ${star <= (app.rating || 0) ? 'text-amber-400 drop-shadow-sm' : 'text-muted-foreground/30 hover:text-amber-400/50'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <div className="flex items-start gap-1.5">
                            {app.match_score >= 80 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${app.match_score >= 60 ? 'text-amber-500' : 'text-rose-500'}`} />
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {app.match_summary}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
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
                              className="h-7 w-7 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              onClick={() => window.open(`/dashboard/recruiter/resume/${app.resume_id}`, '_blank')}
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
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
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
                className="w-full h-40 bg-muted border border-border rounded-md p-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none resize-none custom-scrollbar"
              />
            </div>
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-md" onClick={() => setActiveNoteApp(null)}>Cancel</Button>
              <Button onClick={saveNotes} disabled={savingNote} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                {savingNote ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                Upload Candidates
              </h3>
              {!uploading && (
                <button onClick={() => setUploadModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="p-8">
              {uploading ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">AI Processing</h4>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">{uploadProgress}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="border-2 border-dashed border-border rounded-lg p-10 bg-muted/20 hover:bg-muted/40 transition-colors relative group">
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf,.docx" 
                      onChange={handleBulkUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <UploadCloud className="w-12 h-12 text-primary/50 mx-auto mb-4 group-hover:text-primary transition-colors" />
                    <h4 className="font-bold text-foreground mb-1">Click or drag files here</h4>
                    <p className="text-xs text-muted-foreground">Upload multiple PDF/DOCX resumes. The AI will parse them and evaluate them against this job description automatically.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
