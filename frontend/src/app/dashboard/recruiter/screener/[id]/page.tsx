"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';

interface ScanResult {
  id: string;
  scan_id: string;
  resume_id: string;
  candidate_name: string;
  match_score: number;
  match_summary: string;
  notes: string | null;
  rating: number | null;
  created_at: string;
}

export default function ScreenerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeNoteRes, setActiveNoteRes] = useState<ScanResult | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const res = await api.get(`/api/screener/${id}`);
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (resultId: string, rating: number) => {
    setResults(res => res.map(r => r.id === resultId ? { ...r, rating } : r));
    try {
      await api.put(`/api/screener/${id}/results/${resultId}`, { rating });
    } catch (e) {
      console.error("Failed to update rating", e);
      fetchResults();
    }
  };

  const saveNotes = async () => {
    if (!activeNoteRes) return;
    setSavingNote(true);
    try {
      await api.put(`/api/screener/${id}/results/${activeNoteRes.id}`, { notes: noteText });
      setResults(res => res.map(r => r.id === activeNoteRes.id ? { ...r, notes: noteText } : r));
      setActiveNoteRes(null);
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

  const exportCSV = () => {
    const headers = ["Candidate Name", "Match Score", "Summary", "Date Scanned", "Rating", "Notes"];
    const csvContent = [
      headers.join(","),
      ...results.map(r => `"${r.candidate_name}",${r.match_score},"${r.match_summary.replace(/"/g, '""')}","${new Date(r.created_at).toLocaleDateString()}",${r.rating || ''},"${(r.notes || '').replace(/"/g, '""')}"`)
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `scan_results_${id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.candidate_name.toLowerCase().includes(q) || 
           (r.match_summary && r.match_summary.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans flex flex-col h-screen">
      <header className="flex-none flex justify-between items-center bg-card p-4 md:p-6 shadow-sm border-b border-border z-10 relative">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/recruiter/screener')} className="rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Scan Results
            </h1>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">Candidates are automatically ranked by their AI match score.</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              type="text" 
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={exportCSV} variant="outline" className="rounded-md flex items-center gap-2 text-sm border-primary/30 text-primary hover:bg-primary/10">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p>Loading scan results...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-16 text-center shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-2">No candidates found.</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result, idx) => (
                <div key={result.id} className="bg-card border border-border rounded-lg p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col md:flex-row gap-5 items-start">
                  
                  {/* Rank Badge */}
                  <div className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground items-center justify-center font-bold text-xs mt-1">
                    #{idx + 1}
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                        <span className="md:hidden text-muted-foreground text-sm">#{idx + 1}</span>
                        {result.candidate_name}
                      </h3>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${scoreColor(result.match_score)} shrink-0`}>
                        <span className="text-sm font-black">{result.match_score}</span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => updateRating(result.id, star === result.rating ? 0 : star)}
                          className={`text-xl leading-none ${star <= (result.rating || 0) ? 'text-amber-400 drop-shadow-sm' : 'text-muted-foreground/30 hover:text-amber-400/50'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-start gap-2 mb-4">
                      {result.match_score >= 80 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${result.match_score >= 60 ? 'text-amber-500' : 'text-rose-500'}`} />
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {result.match_summary}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-border mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`rounded-md border-border h-8 px-3 ${result.notes ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => {
                          setActiveNoteRes(result);
                          setNoteText(result.notes || "");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 mr-1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Notes
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center gap-1.5 h-8 px-3"
                        onClick={() => window.open(`/dashboard/recruiter/resume/${result.resume_id}`, '_blank')}
                      >
                        <FileText className="w-3.5 h-3.5" /> View Candidate Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      {activeNoteRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Notes for {activeNoteRes.candidate_name}
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
              <Button variant="ghost" className="rounded-md" onClick={() => setActiveNoteRes(null)}>Cancel</Button>
              <Button onClick={saveNotes} disabled={savingNote} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                {savingNote ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
