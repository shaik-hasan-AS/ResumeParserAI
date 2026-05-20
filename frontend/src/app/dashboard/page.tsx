"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, ArrowRight, CheckCircle2, Clock, ExternalLink, Target } from 'lucide-react';
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
      // Pass the target role via query parameter so the next page can auto-generate
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
    <div className="min-h-screen mesh-bg relative p-8 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center glass-panel p-6 rounded-2xl shadow-sm border border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Manage and analyze your resumes seamlessly.</p>
          </div>
          <Button variant="outline" className="rounded-full px-6 border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white bg-transparent" onClick={() => { localStorage.removeItem('token'); router.push('/'); }}>
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-lg glass-panel rounded-3xl overflow-hidden bg-black/20">
              <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-400 to-pink-500"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-white">New ATS Analysis</CardTitle>
                <CardDescription className="text-base text-zinc-400">Upload a PDF, DOCX, or Image file and specify your target role for tailored AI feedback.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-8 pt-4">
                
                {/* Upload Zone */}
                <div className="relative group">
                  <div className={`absolute inset-0 bg-primary/5 rounded-2xl transform transition-transform duration-300 ease-out ${file ? 'scale-100' : 'scale-95 group-hover:scale-100'}`}></div>
                  <div className={`relative border-2 border-dashed rounded-2xl p-12 w-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer ${file ? 'border-primary bg-primary/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-primary/50'}`}>
                    {file ? (
                      <div className="flex flex-col items-center text-primary animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 mb-4" />
                        <p className="font-bold text-lg text-white">{file.name}</p>
                        <p className="text-sm text-zinc-400 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-zinc-400">
                        <div className="p-4 bg-primary/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-10 h-10 text-primary" />
                        </div>
                        <p className="font-semibold text-lg text-zinc-200">Click to upload or drag & drop</p>
                        <p className="text-sm mt-2">PDF, DOCX, JPG, PNG (Max 10MB)</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.jpg,.jpeg,.png" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                {/* Target Role Input */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-zinc-300 flex items-center gap-2 ml-1">
                    <Target className="w-4 h-4 text-primary" /> Target Role (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-white font-medium placeholder:text-zinc-600 shadow-sm"
                  />
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || loading} 
                  size="lg"
                  className={`w-full rounded-2xl text-lg h-14 transition-all duration-300 ${!file ? 'opacity-50' : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform hover:-translate-y-1'}`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Upload and Analyze <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-0 shadow-md glass-panel rounded-3xl h-full max-h-[650px] flex flex-col bg-black/20">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-primary" /> Recent Resumes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loadingResumes ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p>Loading...</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 flex flex-col items-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <FileText className="w-12 h-12 mb-3 text-zinc-600" />
                    <p className="font-medium">No recent resumes yet.</p>
                    <p className="text-sm mt-1">Upload your first one to see it here.</p>
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      className="group flex flex-col gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => router.push(`/dashboard/resume/${resume.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/20 rounded-lg shadow-sm">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-200 text-sm truncate max-w-[150px]">
                              {resume.original_file_path.split('/').pop()}
                            </h4>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                              {formatDate(resume.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

