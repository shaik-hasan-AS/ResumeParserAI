"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap, Link2, Code2, MapPin, Award, Download } from 'lucide-react';
import api from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';

function getSeniorityLabel(years: number | null | undefined): { label: string; color: string } {
  if (years === null || years === undefined) return { label: 'Unknown', color: 'bg-muted text-muted-foreground border-border' };
  if (years < 2) return { label: 'Entry Level', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  if (years < 5) return { label: 'Mid-level', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  if (years < 10) return { label: 'Senior', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
  return { label: 'Principal / Staff', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
}

const CONTACT_FIELDS = ['name', 'email', 'phone', 'linkedin', 'github', 'location'] as const;
type ContactField = typeof CONTACT_FIELDS[number];

const FIELD_META: Record<ContactField, { label: string; icon: React.ReactNode }> = {
  name:     { label: 'Full name',       icon: <User className="w-4 h-4" /> },
  email:    { label: 'Email',           icon: <Mail className="w-4 h-4" /> },
  phone:    { label: 'Phone',           icon: <Phone className="w-4 h-4" /> },
  linkedin: { label: 'LinkedIn',        icon: <Link2 className="w-4 h-4" /> },
  github:   { label: 'GitHub',          icon: <Code2 className="w-4 h-4" /> },
  location: { label: 'Location',        icon: <MapPin className="w-4 h-4" /> },
};

function ContactBlock({ parsedData }: { parsedData: Record<string, unknown> | null | undefined }) {
  const detected = CONTACT_FIELDS.reduce((acc, key) => acc + (parsedData?.[key] && parsedData[key] !== '' ? 1 : 0), 0);
  const total = CONTACT_FIELDS.length;
  const pct = Math.round((detected / total) * 100);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Contact Information
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {CONTACT_FIELDS.map((key) => {
          const meta = FIELD_META[key];
          const value = parsedData?.[key] as string | undefined;
          const missing = !value;
          const isLink = (key === 'linkedin' || key === 'github') && value;

          return (
            <div key={key} className="flex items-start gap-3 group">
              <div className={`mt-0.5 p-2 rounded-lg border ${
                missing ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-muted/60 border-border text-muted-foreground'
              }`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">{meta.label}</p>
                {missing ? (
                  <p className="text-sm text-muted-foreground italic">Not provided</p>
                ) : isLink ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block font-medium"
                  >
                    {value.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-foreground truncate">{value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SKILL_STYLES = {
  technical: 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  soft:      'bg-amber-500/10  text-amber-300  border border-amber-500/20',
  tools:     'bg-teal-500/10   text-teal-300   border border-teal-500/20',
};
const SKILL_LABELS = { technical: '⚙ Technical', soft: '💬 Soft Skills', tools: '🛠 Tools' };

function ProfileBlock({ parsedData }: { parsedData: Record<string, unknown> | null | undefined }) {
  const seniority = getSeniorityLabel(parsedData?.experience_years as number | null | undefined);
  const categorized = parsedData?.skills_categorized as
    { technical: string[]; soft: string[]; tools: string[] } | undefined;
  const eduEntries = parsedData?.education_entries as
    Array<{ degree: string; institution: string; year: string | null }> | undefined;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {!!(parsedData?.experience_years !== null && parsedData?.experience_years !== undefined) && (
        <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Inferred seniority</p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${seniority.color}`}>
              {seniority.label} · {parsedData.experience_years as string}y exp
            </span>
          </div>
        </div>
      )}

      {eduEntries && eduEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" /> Education
          </h3>
          <div className="space-y-2">
            {eduEntries.map((entry, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-xl p-3 space-y-0.5">
                <p className="text-sm font-semibold text-foreground leading-snug">{entry.degree}</p>
                <p className="text-xs text-muted-foreground">{entry.institution}</p>
                {entry.year && (
                  <p className="text-xs text-primary font-medium">{entry.year}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!!((!eduEntries || eduEntries.length === 0) && parsedData?.education) && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" /> Education
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{parsedData.education as string}</p>
        </div>
      )}

      {!!categorized && (
        <div className="space-y-4">
          {(['technical', 'soft', 'tools'] as const).map(cat => (
            categorized[cat].length > 0 && (
              <div key={cat} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{SKILL_LABELS[cat]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {categorized[cat].map((skill, i) => (
                    <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-full ${SKILL_STYLES[cat]}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {!!parsedData?.experience && (
        <div className="space-y-2 pt-2 border-t border-border">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" /> Experience summary
          </h3>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-6">
            {parsedData.experience as string}
          </p>
        </div>
      )}
    </div>
  );
}

export default function RecruiterResumeViewer() {
  const { id } = useParams();
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parsedData, setParsedData] = useState<any>(null);

  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailType, setEmailType] = useState('interview');
  const [emailJobDesc, setEmailJobDesc] = useState('');
  const [emailTargetRole, setEmailTargetRole] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');

  useEffect(() => {
    const fetchParsedData = async () => {
      try {
        const response = await api.get(`/api/resume/${id}/parsed`);
        setParsedData(response.data.parsed_json);
      } catch (err) {
        console.error('Failed to fetch parsed data', err);
      }
    };
    fetchParsedData();
  }, [id]);

  const handleDownloadOriginal = async () => {
    try {
      const response = await api.get(`/api/resume/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      let fileName = `${parsedData?.name?.replace(/\s+/g, '_') || 'candidate'}_original_resume`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      } else {
         fileName += ".pdf";
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to download file', err);
      alert('Failed to download the original resume. It may have been removed.');
    }
  };

  const handleGenerateEmail = async () => {
    if (!emailJobDesc.trim() || !emailTargetRole.trim()) return;
    setGeneratingEmail(true);
    try {
      const res = await api.post(`/api/resume/${id}/outreach_email`, {
        target_role: emailTargetRole,
        job_description: emailJobDesc,
        email_type: emailType
      });
      setGeneratedEmail(res.data.email_text);
    } catch (e) {
      console.error(e);
      alert('Failed to generate email.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  if (!parsedData) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading Candidate Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 pb-24 font-sans text-[16px] overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Candidate Profile
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Extracted resume information</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setEmailModalOpen(true)}
              className="border-primary/30 text-primary hover:bg-primary/10 shadow-sm h-9 px-4 rounded-lg font-semibold flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              AI Outreach
            </Button>
            <Button
              onClick={handleDownloadOriginal}
              className="bg-primary hover:bg-primary/90 text-white shadow-sm h-9 px-4 rounded-lg font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 items-start transition-all duration-300 md:grid-cols-2">
          {/* Left Column: Contact */}
          <div className="space-y-4">
            <ContactBlock parsedData={parsedData} />
          </div>

          {/* Right Column: Profile */}
          <div className="space-y-4">
            <ProfileBlock parsedData={parsedData} />
          </div>
        </div>
      </div>

      {/* Outreach Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Generate AI Outreach Email
              </h3>
              <button onClick={() => setEmailModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {generatedEmail ? (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-foreground">Generated Draft</h4>
                    <Button variant="outline" size="sm" onClick={() => {navigator.clipboard.writeText(generatedEmail); alert("Copied!");}}>Copy to Clipboard</Button>
                  </div>
                  <textarea 
                    value={generatedEmail}
                    onChange={(e) => setGeneratedEmail(e.target.value)}
                    className="w-full flex-1 min-h-[300px] bg-muted border border-border rounded-md p-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none custom-scrollbar"
                  />
                  <div className="flex justify-end pt-2">
                    <Button variant="ghost" onClick={() => setGeneratedEmail('')}>Draft Another</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email Type</label>
                    <select 
                      value={emailType}
                      onChange={(e) => setEmailType(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="interview">Invite to Interview</option>
                      <option value="initial_contact">Initial Reach Out / Sourcing</option>
                      <option value="rejection">Polite Rejection</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Target Role</label>
                    <input 
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={emailTargetRole}
                      onChange={(e) => setEmailTargetRole(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Job Description / Context</label>
                    <textarea 
                      placeholder="Paste the job description or context about why you are reaching out..."
                      value={emailJobDesc}
                      onChange={(e) => setEmailJobDesc(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none min-h-[150px] resize-y custom-scrollbar"
                    />
                  </div>
                </>
              )}
            </div>

            {!generatedEmail && (
              <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
                <Button variant="ghost" className="rounded-md" onClick={() => setEmailModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleGenerateEmail} 
                  disabled={generatingEmail || !emailTargetRole || !emailJobDesc} 
                  className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {generatingEmail ? 'Generating...' : 'Generate Email'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
