"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';
import { Briefcase, Plus, Users, Clock, Target, UploadCloud, Search, ListFilter, ArrowLeft } from 'lucide-react';

interface QuickScan {
  id: string;
  title: string;
  description: string;
  keywords: string | null;
  created_at: string;
  results_count: number;
}

export default function ScreenerDashboard() {
  const [scans, setScans] = useState<QuickScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  const router = useRouter();

  const fetchScans = async () => {
    try {
      const res = await api.get('/api/screener');
      setScans(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleCreateScan = async () => {
    if (!newTitle.trim() || !newDescription.trim() || files.length === 0) return;
    setCreating(true);
    setUploadProgress(`Uploading and analyzing ${files.length} resumes... This might take a minute.`);
    
    const formData = new FormData();
    formData.append('title', newTitle);
    formData.append('description', newDescription);
    formData.append('keywords', newKeywords);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await api.post('/api/screener', formData);
      setShowCreateModal(false);
      
      // Navigate directly to the new scan results
      if (res.data && res.data.scan_id) {
        router.push(`/dashboard/recruiter/screener/${res.data.scan_id}`);
      } else {
        fetchScans();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create scan. Ensure you uploaded valid PDFs.");
    } finally {
      setCreating(false);
      setUploadProgress("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-border mb-6">
          <button 
            onClick={() => router.push('/dashboard/recruiter')} 
            className="py-2 px-4 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Job Postings
          </button>
          <button 
            className="py-2 px-4 border-b-2 border-primary text-foreground font-bold"
          >
            Quick ATS Screener
          </button>
        </div>

        <header className="flex justify-between items-center bg-card p-6 rounded-lg shadow-sm border border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              Quick ATS Screener
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Bulk rank resumes instantly without creating a permanent job pipeline.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Past Scans</h2>
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-md h-10 px-6 font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Scan
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Loading your scans...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <ListFilter className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No scans yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">Create your first quick scan to instantly rank a batch of resumes.</p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" className="rounded-md border-primary/30 text-primary hover:bg-primary/10">
              Run first scan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scans.map((scan) => (
              <div key={scan.id} onClick={() => router.push(`/dashboard/recruiter/screener/${scan.id}`)} className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{scan.title}</h3>
                  {scan.keywords && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {scan.keywords.split(',').slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase font-bold">{kw.trim()}</span>
                      ))}
                      {scan.keywords.split(',').length > 3 && <span className="text-[10px] text-muted-foreground px-1 py-0.5">+{scan.keywords.split(',').length - 3}</span>}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {scan.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(scan.created_at)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                    <Users className="w-3.5 h-3.5" /> {scan.results_count} Ranked
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Scan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-card w-full max-w-2xl border border-border rounded-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Run ATS Screener</h2>
              
              {creating ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">AI Processing</h4>
                    <p className="text-sm text-muted-foreground mt-2">{uploadProgress}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Scan Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Frontend Batch 1"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Role Description</label>
                    <textarea 
                      placeholder="Paste the target job description or core responsibilities..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none min-h-[150px] resize-y custom-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Must-Have Keywords (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React, TypeScript, Next.js, 5+ years"
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Upload Resumes</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 bg-muted/20 hover:bg-muted/40 transition-colors relative group text-center">
                      <input 
                        type="file" 
                        multiple 
                        accept=".pdf,.docx" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <UploadCloud className="w-8 h-8 text-primary/50 mx-auto mb-3 group-hover:text-primary transition-colors" />
                      <h4 className="font-bold text-foreground text-sm mb-1">
                        {files.length > 0 ? `${files.length} files selected` : "Click or drag files here"}
                      </h4>
                      <p className="text-xs text-muted-foreground">Select multiple PDF/DOCX resumes to rank against this description.</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-md">Cancel</Button>
                    <Button onClick={handleCreateScan} disabled={creating || !newTitle || !newDescription || files.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm px-8">
                      Run Scan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
