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
  created_at: string;
}

export default function ScreenerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchResults();
  }, [id]);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  const exportCSV = () => {
    const headers = ["Candidate Name", "Match Score", "Summary", "Date Scanned"];
    const csvContent = [
      headers.join(","),
      ...results.map(r => `"${r.candidate_name}",${r.match_score},"${r.match_summary.replace(/"/g, '""')}","${new Date(r.created_at).toLocaleDateString()}"`)
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
          ) : results.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-16 text-center shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-2">No candidates found in this scan.</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div key={result.id} className="bg-card border border-border rounded-lg p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col md:flex-row gap-5 items-start">
                  
                  {/* Rank Badge */}
                  <div className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground items-center justify-center font-bold text-xs">
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

                    <div className="flex justify-end pt-3 border-t border-border">
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
    </div>
  );
}
