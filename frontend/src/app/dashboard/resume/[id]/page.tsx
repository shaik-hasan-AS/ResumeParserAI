"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Briefcase, Sparkles, GraduationCap, ArrowRight, CheckCircle2, AlertTriangle, ListOrdered, Edit3, Target, Link2, Code2, MapPin, Pencil, Award, FileText } from 'lucide-react';
import api from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import dynamic from 'next/dynamic';
import ResumePDF from '@/components/ResumePDF';
import { Download } from 'lucide-react';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { 
    ssr: false, 
    loading: () => <Button disabled variant="outline" className="h-9 px-4 text-sm rounded-lg border-border"><Download className="w-4 h-4 mr-2" /> Loading PDF...</Button> 
  }
);

function getSeniorityLabel(years: number | null | undefined): { label: string; color: string } {
  if (years === null || years === undefined) return { label: 'Unknown', color: 'bg-muted text-muted-foreground border-border' };
  if (years < 2) return { label: 'Entry Level', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  if (years < 5) return { label: 'Mid-level', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  if (years < 10) return { label: 'Senior', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
  return { label: 'Principal / Staff', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
}

const CONTACT_FIELDS = ['name', 'email', 'phone', 'linkedin', 'github', 'location'] as const;
type ContactField = typeof CONTACT_FIELDS[number];

function countDetected(data: Record<string, unknown> | null | undefined, overrides: Record<ContactField, string>): number {
  return CONTACT_FIELDS.reduce((acc, key) => {
    const val = overrides[key] || data?.[key];
    return acc + (val && val !== '' ? 1 : 0);
  }, 0);
}

// ─── Contact Block ───────────────────────────────────────────────────────────

const FIELD_META: Record<ContactField, { label: string; icon: React.ReactNode; placeholder: string }> = {
  name:     { label: 'Full name',       icon: <User className="w-4 h-4" />,    placeholder: 'Enter full name' },
  email:    { label: 'Email',           icon: <Mail className="w-4 h-4" />,    placeholder: 'Enter email address' },
  phone:    { label: 'Phone',           icon: <Phone className="w-4 h-4" />,   placeholder: 'Enter phone number' },
  linkedin: { label: 'LinkedIn',        icon: <Link2 className="w-4 h-4" />,   placeholder: 'linkedin.com/in/username' },
  github:   { label: 'GitHub',          icon: <Code2 className="w-4 h-4" />,  placeholder: 'github.com/username' },
  location: { label: 'Location',        icon: <MapPin className="w-4 h-4" />,  placeholder: 'City, Country' },
};

function ContactBlock({ parsedData, overrides, setOverrides }: { parsedData: Record<string, unknown> | null | undefined, overrides: Record<ContactField, string>, setOverrides: React.Dispatch<React.SetStateAction<Record<ContactField, string>>> }) {
  const [editing, setEditing] = useState<Record<ContactField, boolean>>(
    CONTACT_FIELDS.reduce((acc, k) => ({ ...acc, [k]: false }), {} as Record<ContactField, boolean>)
  );

  const detected = countDetected(parsedData, overrides);
  const total = CONTACT_FIELDS.length;
  const pct = Math.round((detected / total) * 100);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
      {/* Completeness bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Contact
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {detected}/{total} fields detected
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Field list */}
      <div className="space-y-3">
        {CONTACT_FIELDS.map((key) => {
          const meta = FIELD_META[key];
          const extracted = parsedData?.[key] as string | undefined;
          const override = overrides[key];
          const value = override || extracted;
          const missing = !value;
          const isEditing = editing[key];
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
                {isEditing ? (
                  <input
                    autoFocus
                    type="text"
                    defaultValue={value || ''}
                    placeholder={meta.placeholder}
                    onBlur={(e) => {
                      setOverrides(prev => ({ ...prev, [key]: e.target.value }));
                      setEditing(prev => ({ ...prev, [key]: false }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditing(prev => ({ ...prev, [key]: false }));
                    }}
                    className="w-full text-sm bg-muted border border-primary/40 rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : missing ? (
                  <button
                    onClick={() => setEditing(prev => ({ ...prev, [key]: true }))}
                    className="text-sm text-rose-400/80 italic flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Click to add {meta.label.toLowerCase()}
                  </button>
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{value}</p>
                    <button
                      onClick={() => setEditing(prev => ({ ...prev, [key]: true }))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Profile Block ───────────────────────────────────────────────────────────

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
      {/* Seniority */}
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

      {/* Education */}
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

      {/* Raw fallback if no structured entries */}
      {!!((!eduEntries || eduEntries.length === 0) && parsedData?.education) && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" /> Education
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{parsedData.education as string}</p>
        </div>
      )}

      {/* Skills */}
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

      {/* Experience raw text */}
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

// Simple Circular Progress Component
const CircularProgress = ({ value, color, size = 120, strokeWidth = 10 }: { value: number, color: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-foreground/5"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground leading-none">{value}</span>
      </div>
    </div>
  );
};

export default function ResumeViewer() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get('role');
  const urlJd = searchParams.get('jd');
  
  const [overrides, setOverrides] = useState<Record<ContactField, string>>(
    CONTACT_FIELDS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as Record<ContactField, string>)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parsedData, setParsedData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedback, setFeedback] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [targetRole, setTargetRole] = useState(urlRole || "");
  const [jobDescription, setJobDescription] = useState(urlJd || "");
  const [activeTab, setActiveTab] = useState<'strengths' | 'improvements' | 'action_plan' | 'rewrites'>('strengths');
  const hasAutoGenerated = useRef(false);

  const generateFeedback = useCallback(async (roleToUse?: string) => {
    const role = typeof roleToUse === 'string' ? roleToUse : targetRole;
    setLoadingFeedback(true);
    try {
      const response = await api.post(`/api/resume/${id}/feedback`, {
        target_role: role || null,
        job_description: jobDescription || null
      });
      let parsedFeedback = null;
      try {
        parsedFeedback = JSON.parse(response.data.feedback_text);
      } catch (e) {
        console.log("Could not parse feedback as JSON, using raw text", e);
      }
      setFeedback({
        ...response.data,
        structured_data: parsedFeedback
      });
    } catch (err) {
      console.error('Failed to generate feedback', err);
    } finally {
      setLoadingFeedback(false);
    }
  }, [id, targetRole]);

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

  useEffect(() => {
    if (parsedData && urlRole && !hasAutoGenerated.current) {
      hasAutoGenerated.current = true;
      generateFeedback(urlRole);
    }
  }, [parsedData, urlRole, generateFeedback]);

  // `generateFeedback` is now defined above

  if (!parsedData) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading Analysis...</p>
      </div>
    </div>
  );

  const structData = feedback?.structured_data;

  return (
    <div className="min-h-screen bg-background relative p-4 md:p-8 pb-24 font-sans text-[16px] overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Resume Insights
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Review extracted details and AI evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {parsedData && (
              <PDFDownloadLink
                document={
                  <ResumePDF 
                    parsedData={parsedData} 
                    overrides={overrides} 
                    aiRewrites={structData?.bullet_point_rewrites}
                    structuredExperience={structData?.structured_experience}
                  />
                }
                fileName={`${parsedData?.name ? parsedData.name.replace(/\s+/g, '_') : 'Resume'}.pdf`}
              >
                {({ loading }: { loading: boolean }) => (
                  <Button 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white shadow-sm h-9 px-4 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {loading ? 'Preparing...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact + Profile */}
          <div className="lg:col-span-4 space-y-4">
            <ContactBlock parsedData={parsedData} overrides={overrides} setOverrides={setOverrides} />
            <ProfileBlock parsedData={parsedData} />
          </div>

          {/* Right Column: ATS Score & Feedback */}
          <div className="lg:col-span-8 space-y-6">
            {!feedback ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-xl h-full flex flex-col justify-center min-h-[500px]">
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                    {loadingFeedback ? (
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground">
                    {loadingFeedback ? 'Simulating ATS...' : 'Run ATS Analysis'}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {loadingFeedback 
                      ? 'Our AI is evaluating your resume against industry standards.'
                      : 'Provide a target role to get an exact match score, keyword analysis, and bullet point rewrites.'}
                  </p>

                  {!loadingFeedback && (
                    <div className="space-y-4 pt-4">
                      <div className="text-left space-y-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 ml-1">
                          <Target className="w-4 h-4 text-primary" /> Target Role
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Senior Software Engineer"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="text-left space-y-2 pt-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 ml-1">
                          <FileText className="w-4 h-4 text-primary" /> Job Description (Optional)
                        </label>
                        <textarea 
                          placeholder="Paste the full job description here..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          maxLength={5000}
                          className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground min-h-[120px] resize-y custom-scrollbar text-sm"
                        />
                      </div>
                      <Button 
                        onClick={() => generateFeedback()} 
                        disabled={loadingFeedback}
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] h-12 rounded-xl font-semibold"
                      >
                        Generate Score
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Score Rings Section */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="flex-1 space-y-3 z-10 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground">ATS Analysis Results</h2>
                    {targetRole && <p className="text-muted-foreground">Target Role: <span className="text-foreground font-medium">{targetRole}</span></p>}
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                      {structData?.summary || 'We evaluated your resume layout, content, and potential impact against ATS systems.'}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setFeedback(null); setTargetRole(""); }} 
                      className="mt-4 border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg h-9 px-4 text-sm bg-transparent"
                    >
                      Analyze Different Role
                    </Button>
                  </div>
                  
                  <div className="flex gap-8 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <CircularProgress value={feedback.score} color="#a855f7" size={130} strokeWidth={12} />
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ATS Score</span>
                    </div>
                    {structData?.keyword_match_rate !== undefined && (
                      <div className="flex flex-col items-center gap-3">
                        <CircularProgress value={structData.keyword_match_rate} color="#14b8a6" size={130} strokeWidth={12} />
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Keyword Match</span>
                      </div>
                    )}
                  </div>
                </div>

                {structData && (
                  <div className="space-y-6">
                    
                    {/* Tabs Navigation */}
                    <div className="flex gap-2 p-1 bg-card border border-border rounded-xl overflow-x-auto custom-scrollbar">
                      <button 
                        onClick={() => setActiveTab('strengths')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'strengths' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50'}`}
                      >
                        Strengths
                      </button>
                      <button 
                        onClick={() => setActiveTab('improvements')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'improvements' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50'}`}
                      >
                        Areas to Improve
                      </button>
                      <button 
                        onClick={() => setActiveTab('action_plan')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'action_plan' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50'}`}
                      >
                        Action Plan
                      </button>
                      <button 
                        onClick={() => setActiveTab('rewrites')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'rewrites' ? 'bg-muted text-foreground flex items-center gap-2' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50 flex items-center gap-2'}`}
                      >
                        <Sparkles className="w-4 h-4" /> Bullet Rewrites
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl min-h-[300px]">
                      
                      {activeTab === 'strengths' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Strengths
                          </h3>
                          <div className="grid gap-4">
                            {structData.strengths?.map((str: string, i: number) => (
                              <div key={i} className="bg-muted border-l-4 border-l-emerald-500 rounded-r-xl p-5 border border-y-white/5 border-r-white/5 shadow-sm">
                                <p className="text-muted-foreground leading-relaxed text-sm">{str}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'improvements' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Areas to Improve
                          </h3>
                          <div className="grid gap-4">
                            {structData.weaknesses?.map((weak: string, i: number) => (
                              <div key={i} className="bg-muted border-l-4 border-l-amber-500 rounded-r-xl p-5 border border-y-white/5 border-r-white/5 shadow-sm">
                                <p className="text-muted-foreground leading-relaxed text-sm">{weak}</p>
                              </div>
                            ))}
                          </div>
                          
                          {structData.missing_skills && structData.missing_skills.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-border">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Suggested Skills to Add</h4>
                              <div className="flex flex-wrap gap-2">
                                {structData.missing_skills.map((skill: string, i: number) => (
                                  <span key={i} className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-4 py-2 rounded-full text-sm font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'action_plan' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                            <ListOrdered className="w-5 h-5 text-primary" /> Recommended Action Plan
                          </h3>
                          <div className="space-y-4">
                            {structData.actionable_improvements?.map((action: string, i: number) => (
                              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-muted border border-border">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                  {i + 1}
                                </div>
                                <p className="text-muted-foreground leading-relaxed mt-1 text-sm">{action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'rewrites' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                              <Edit3 className="w-5 h-5 text-indigo-400" /> AI Bullet Rewrites
                            </h3>
                            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20">
                              Impact-driven format
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-5">
                            {structData.bullet_point_rewrites?.map((rewrite: { original: string, improved: string, reasoning: string }, i: number) => (
                              <div key={i} className="flex flex-col md:flex-row gap-0 rounded-xl overflow-hidden border border-border shadow-sm group hover:-translate-y-1 transition-transform duration-300">
                                {/* Original Side */}
                                <div className="flex-1 bg-rose-500/5 p-6 relative">
                                  <span className="text-xs font-bold text-rose-500/70 uppercase tracking-wider mb-2 block">Original</span>
                                  <p className="text-muted-foreground italic text-sm leading-relaxed">&quot;{rewrite.original}&quot;</p>
                                </div>
                                
                                {/* Divider with Icon */}
                                <div className="hidden md:flex items-center justify-center bg-card px-3 z-10 relative">
                                  <div className="absolute top-0 bottom-0 w-px bg-muted/50 left-1/2 transform -translate-x-1/2"></div>
                                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center relative z-10">
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </div>
                                </div>
                                <div className="md:hidden flex items-center justify-center h-8 bg-card">
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>

                                {/* Improved Side */}
                                <div className="flex-1 bg-emerald-500/5 p-6 flex flex-col justify-between relative">
                                  <div>
                                    <span className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider mb-2 block">Improved</span>
                                    <p className="text-foreground font-medium text-sm leading-relaxed">&quot;{rewrite.improved}&quot;</p>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-emerald-500/10">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      <span className="text-primary font-bold mr-1">Why:</span>
                                      {rewrite.reasoning}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!structData.bullet_point_rewrites || structData.bullet_point_rewrites.length === 0) && (
                              <div className="text-center py-12 text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
                                <p className="font-medium">No rewrites suggested.</p>
                                <p className="text-sm mt-1">Your bullet points are already strong!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
                
                {!structData && (
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-foreground mb-4">Detailed Feedback</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{feedback.feedback_text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
