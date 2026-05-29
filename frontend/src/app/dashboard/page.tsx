"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CloudUpload, FileText, ArrowRight, X, Clock, ExternalLink, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  interface Resume {
    id: number;
    original_file_path: string;
    uploaded_at: string;
  }
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get('/api/resume/');
        setResumes(response.data);
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/dashboard/resume/${response.data.id}?role=${encodeURIComponent(targetRole)}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 overflow-hidden font-sans">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Resume Upload
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Upload your resume to get instant ATS feedback.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" className="rounded-xl px-6 text-muted-foreground hover:bg-muted/50 hover:text-foreground" onClick={() => { localStorage.removeItem('token'); router.push('/'); }}>
              Logout
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-card border border-border shadow-xl rounded-3xl p-8 flex flex-col gap-6">
              
              <div className="mb-2">
                <h2 className="text-xl font-bold text-foreground">Upload Document</h2>
                <p className="text-sm text-muted-foreground">Supported formats are PDF and DOCX.</p>
              </div>

              {/* Upload Zone */}
              <div className="relative group">
                <div className={`relative border-2 border-dashed rounded-3xl p-16 w-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/50 hover:bg-muted hover:border-primary/40'}`}>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="p-5 bg-muted rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-border">
                      <CloudUpload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-medium text-lg text-foreground mb-2">Drop your PDF or DOCX here</p>
                    <p className="text-muted-foreground text-sm">
                      or <span className="text-primary font-semibold group-hover:underline">Browse files</span>
                    </p>
                  </div>
                  
                  <input 
                    type="file" 
                    accept=".pdf,.docx" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Badges and Size Note */}
              <div className="flex items-center justify-between px-2">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border">PDF</Badge>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border">DOCX</Badge>
                </div>
                <span className="text-xs text-muted-foreground">Max size: 10MB</span>
              </div>

              {/* Post-Upload State */}
              {file && (
                <div className="mt-4 p-4 rounded-xl bg-muted border border-primary/20 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-foreground text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Target Role Input */}
              <div className="space-y-3 mt-4">
                <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Target Role (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground"
                />
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={!file || loading} 
                size="lg"
                className={`w-full rounded-xl text-base font-semibold h-14 mt-4 transition-all duration-300 ${!file ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border border-border hover:bg-muted' : 'bg-primary hover:bg-primary/90 text-foreground shadow-[0_0_20px_rgba(147,51,234,0.3)]'}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze Resume <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border shadow-xl rounded-3xl h-full max-h-[650px] flex flex-col">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Recent Uploads
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loadingResumes ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-sm">Loading history...</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center bg-muted rounded-2xl border border-dashed border-border">
                    <FileText className="w-10 h-10 mb-3 opacity-50" />
                    <p className="font-medium text-sm">No recent resumes.</p>
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      className="group flex flex-col gap-3 p-4 rounded-2xl bg-muted hover:bg-[#222230] border border-border transition-all cursor-pointer"
                      onClick={() => router.push(`/dashboard/resume/${resume.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-zinc-200 text-sm truncate max-w-[150px]">
                              {resume.original_file_path.split('/').pop()}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(resume.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
