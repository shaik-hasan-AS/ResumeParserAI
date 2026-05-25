"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CloudUpload, FileText, ArrowRight, X, Clock, ExternalLink, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
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
    <div className="min-h-screen bg-[#0a0a0f] relative p-4 md:p-8 overflow-hidden font-sans">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center bg-[#12121a] p-6 rounded-2xl shadow-sm border border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Resume Upload
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">Upload your resume to get instant ATS feedback.</p>
          </div>
          <Button variant="ghost" className="rounded-xl px-6 text-zinc-400 hover:bg-white/5 hover:text-white" onClick={() => { localStorage.removeItem('token'); router.push('/'); }}>
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-[#12121a] border border-white/5 shadow-xl rounded-3xl p-8 flex flex-col gap-6">
              
              <div className="mb-2">
                <h2 className="text-xl font-bold text-white">Upload Document</h2>
                <p className="text-sm text-zinc-400">Supported formats are PDF and DOCX.</p>
              </div>

              {/* Upload Zone */}
              <div className="relative group">
                <div className={`relative border-2 border-dashed rounded-3xl p-16 w-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40'}`}>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="p-5 bg-[#1a1a24] rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-white/5">
                      <CloudUpload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-medium text-lg text-white mb-2">Drop your PDF or DOCX here</p>
                    <p className="text-zinc-400 text-sm">
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
                  <Badge variant="outline" className="bg-[#1a1a24] text-zinc-300 border-white/10">PDF</Badge>
                  <Badge variant="outline" className="bg-[#1a1a24] text-zinc-300 border-white/10">DOCX</Badge>
                </div>
                <span className="text-xs text-zinc-500">Max size: 10MB</span>
              </div>

              {/* Post-Upload State */}
              {file && (
                <div className="mt-4 p-4 rounded-xl bg-[#1a1a24] border border-primary/20 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-white text-sm truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Target Role Input */}
              <div className="space-y-3 mt-4">
                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Target Role (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white font-medium placeholder:text-zinc-600"
                />
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={!file || loading} 
                size="lg"
                className={`w-full rounded-xl text-base font-semibold h-14 mt-4 transition-all duration-300 ${!file ? 'opacity-50 cursor-not-allowed bg-[#1a1a24] text-zinc-500 border border-white/5 hover:bg-[#1a1a24]' : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'}`}
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
            <div className="bg-[#12121a] border border-white/5 shadow-xl rounded-3xl h-full max-h-[650px] flex flex-col">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Recent Uploads
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loadingResumes ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-sm">Loading history...</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 flex flex-col items-center bg-[#1a1a24] rounded-2xl border border-dashed border-white/5">
                    <FileText className="w-10 h-10 mb-3 opacity-50" />
                    <p className="font-medium text-sm">No recent resumes.</p>
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      className="group flex flex-col gap-3 p-4 rounded-2xl bg-[#1a1a24] hover:bg-[#222230] border border-white/5 transition-all cursor-pointer"
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
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {formatDate(resume.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors mt-1" />
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
