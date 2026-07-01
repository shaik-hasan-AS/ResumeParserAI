"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Briefcase, Sparkles, GraduationCap, ArrowRight, CheckCircle2, AlertTriangle, ListOrdered, Edit3, Target, Link2, Code2, MapPin, Pencil, Award, FileText, Mic, MicOff, UploadCloud, Wand2, StopCircle, Flame, Swords } from 'lucide-react';
import api from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import ResumeHTML from '@/components/ResumeHTML';
import CoverLetterHTML from '@/components/CoverLetterHTML';
import { Download } from 'lucide-react';



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
  
  const [printTarget, setPrintTarget] = useState<'none' | 'resume' | 'cover_letter'>('none');
  
  const [overrides, setOverrides] = useState<Record<ContactField, string>>(
    CONTACT_FIELDS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as Record<ContactField, string>)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parsedData, setParsedData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedback, setFeedback] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`feedback_${id}`);
        if (cached) return JSON.parse(cached);
      } catch { /* ignore */ }
    }
    return null;
  });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // ── Roast state ────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [roast, setRoast] = useState<any>(null);
  const [loadingRoast, setLoadingRoast] = useState(false);
  const [showRoast, setShowRoast] = useState(false);

  const [targetRole, setTargetRole] = useState(urlRole || "");
  const [jobDescription, setJobDescription] = useState(urlJd || "");
  const [activeTab, setActiveTab] = useState<'strengths' | 'improvements' | 'action_plan' | 'rewrites' | 'cover_letter' | 'mock_interview' | 'ats_match'>('strengths');
  const [pdfTheme, setPdfTheme] = useState<'modern' | 'harvard' | 'executive'>('modern');

  // ATS Matcher State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [atsMatch, setAtsMatch] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`ats_match_${id}`);
        if (cached) return JSON.parse(cached);
      } catch { /* ignore */ }
    }
    return null;
  });
  const [loadingAtsMatch, setLoadingAtsMatch] = useState(false);
  const [speechSuggestions, setSpeechSuggestions] = useState<string[]>([]);
  const [loadingSpeechSuggestions, setLoadingSpeechSuggestions] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`cover_letter_${id}`) || null;
    }
    return null;
  });
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mockInterview, setMockInterview] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`mock_interview_${id}`);
        if (cached) return JSON.parse(cached);
      } catch { /* ignore */ }
    }
    return null;
  });
  const [loadingMockInterview, setLoadingMockInterview] = useState(false);

  // ── Audio enhancement state ────────────────────────────────────────────────
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioSuccess, setAudioSuccess] = useState(false);
  const [audioDragging, setAudioDragging] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioFile(null);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      alert('Microphone access denied. Please allow mic permissions and try again.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleAudioEnhance = async () => {
    const source = audioFile || audioBlob;
    if (!source) return;
    setLoadingAudio(true);
    setAudioSuccess(false);
    try {
      const formData = new FormData();
      const file = audioFile ?? new File([audioBlob!], 'recording.webm', { type: 'audio/webm' });
      formData.append('audio', file);
      await api.post(`/api/resume/${id}/enhance-audio`, formData);
      setAudioSuccess(true);
      // Navigate to builder so user sees enhanced result
      setTimeout(() => router.push(`/dashboard/builder/${id}`), 1200);
    } catch (err: any) {
      alert(`Audio enhancement failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setLoadingAudio(false);
    }
  };

  // ── Mock Interview Practice State & Handlers ───────────────────────────────
  const [evaluations, setEvaluations] = useState<Record<number, {
    transcript?: string;
    score?: number;
    feedback?: string;
    better_phrasing?: string;
    loading?: boolean;
  }>>({});
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [recordedBlobs, setRecordedBlobs] = useState<Record<number, Blob>>({});
  const practiceChunksRef = useRef<BlobPart[]>([]);
  const practiceRecorderRef = useRef<MediaRecorder | null>(null);

  const startPracticeRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      practiceChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) practiceChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(practiceChunksRef.current, { type: 'audio/webm' });
        setRecordedBlobs(prev => ({ ...prev, [index]: blob }));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      practiceRecorderRef.current = mr;
      setRecordingIndex(index);
    } catch {
      alert('Microphone access denied. Please allow mic permissions.');
    }
  };

  const stopPracticeRecording = () => {
    practiceRecorderRef.current?.stop();
    setRecordingIndex(null);
  };

  const evaluatePracticeAnswer = async (index: number, question: string, expectedHints: string[]) => {
    const blob = recordedBlobs[index];
    if (!blob) return;
    setEvaluations(prev => ({ ...prev, [index]: { ...prev[index], loading: true } }));
    try {
      const formData = new FormData();
      formData.append('audio', new File([blob], `answer_${index}.webm`, { type: 'audio/webm' }));
      formData.append('question', question);
      formData.append('expected_hints', expectedHints.join(','));

      const response = await api.post(`/api/resume/${id}/mock-interview/evaluate`, formData);
      setEvaluations(prev => ({ ...prev, [index]: response.data }));
    } catch (err: any) {
      alert(`Answer evaluation failed: ${err?.response?.data?.detail || err.message}`);
      setEvaluations(prev => ({ ...prev, [index]: { ...prev[index], loading: false } }));
    }
  };

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
      const result = { ...response.data, structured_data: parsedFeedback };
      setFeedback(result);
      // Cache so navigating to builder and back doesn't lose the results
      sessionStorage.setItem(`feedback_${id}`, JSON.stringify(result));
    } catch (err) {
      console.error('Failed to generate feedback', err);
    } finally {
      setLoadingFeedback(false);
    }
  }, [id, targetRole, jobDescription]);

  const roastMyResume = async () => {
    setLoadingRoast(true);
    setShowRoast(true);
    try {
      const response = await api.post(`/api/resume/${id}/roast`);
      setRoast(response.data);
    } catch (err) {
      console.error('Roast failed', err);
    } finally {
      setLoadingRoast(false);
    }
  };


  const generateCoverLetter = async () => {
    setLoadingCoverLetter(true);
    try {
      const response = await api.post(`/api/resume/${id}/coverletter`, {
        target_role: targetRole || null,
        job_description: jobDescription || ''
      });
      setCoverLetter(response.data.cover_letter_text);
      sessionStorage.setItem(`cover_letter_${id}`, response.data.cover_letter_text);
    } catch (err) {
      console.error('Failed to generate cover letter', err);
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const generateMockInterview = async () => {
    setLoadingMockInterview(true);
    try {
      const response = await api.post(`/api/resume/${id}/mock-interview`, {
        target_role: targetRole || null,
        job_description: jobDescription || ''
      });
      setMockInterview(response.data);
      sessionStorage.setItem(`mock_interview_${id}`, JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to generate mock interview', err);
    } finally {
      setLoadingMockInterview(false);
    }
  };

  const generateAtsMatch = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a Job Description in the left panel first.");
      return;
    }
    setLoadingAtsMatch(true);
    try {
      const response = await api.post(`/api/resume/${id}/ats-match`, {
        job_description: jobDescription,
        target_role: targetRole || null
      });
      setAtsMatch(response.data);
      sessionStorage.setItem(`ats_match_${id}`, JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to generate ATS Match report', err);
      alert("Failed to analyze ATS match.");
    } finally {
      setLoadingAtsMatch(false);
    }
  };

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
    if (!parsedData) return;

    const fetchSpeechSuggestions = async () => {
      setLoadingSpeechSuggestions(true);
      try {
        const response = await api.get(`/api/resume/${id}/speech-suggestions`);
        setSpeechSuggestions(response.data.suggestions);
        sessionStorage.setItem(`speech_suggestions_${id}`, JSON.stringify(response.data.suggestions));
      } catch (err) {
        console.error("Failed to fetch speech suggestions", err);
      } finally {
        setLoadingSpeechSuggestions(false);
      }
    };

    try {
      const cached = sessionStorage.getItem(`speech_suggestions_${id}`);
      if (cached) {
        setSpeechSuggestions(JSON.parse(cached));
      } else {
        fetchSpeechSuggestions();
      }
    } catch {
      fetchSpeechSuggestions();
    }
  }, [id, parsedData]);

  useEffect(() => {
    if (parsedData && urlRole && !hasAutoGenerated.current) {
      hasAutoGenerated.current = true;
      generateFeedback(urlRole);
    }
  }, [parsedData, urlRole, generateFeedback]);

  // `generateFeedback` is now defined above

  const handleDownloadDocx = () => {
    const htmlContent = document.getElementById('resume-html-content')?.outerHTML;
    if (!htmlContent) return alert('Content not found');
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title></head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + htmlContent + postHtml;
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const fileName = `${parsedData?.name ? parsedData.name.replace(/\s+/g, '_') : 'Resume'}.doc`;
    const link = document.createElement('a');
    link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handlePrintPDF = (target: 'resume' | 'cover_letter') => {
    setPrintTarget(target);
    setTimeout(() => {
      window.print();
      setPrintTarget('none');
    }, 100);
  };


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
    <>
    <div className={`min-h-screen bg-background relative p-4 md:p-8 pb-24 font-sans text-[16px] overflow-hidden ${printTarget !== 'none' ? 'hidden' : 'block print:hidden'}`}>
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-lg shadow-sm border border-border">
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
              <div className="flex items-center gap-3 bg-muted border border-border p-1.5 rounded-xl">
                <select 
                  value={pdfTheme} 
                  onChange={(e) => setPdfTheme(e.target.value as 'modern' | 'harvard' | 'executive')}
                  className="bg-transparent text-sm font-medium text-foreground outline-none border-none cursor-pointer pl-2 pr-1"
                >
                  <option value="modern" className="bg-background text-foreground">Modern Professional</option>
                  <option value="harvard" className="bg-background text-foreground">Harvard Format</option>
                  <option value="executive" className="bg-background text-foreground">Executive</option>
                </select>
                <Button
                  onClick={() => handlePrintPDF('resume')}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm h-9 px-4 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Resume PDF
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button 
                  onClick={handleDownloadDocx}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 px-4 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Resume DOCX
                </Button>
                {coverLetter && (
                  <>
                    <div className="w-px h-6 bg-border" />
                    <Button
                      onClick={() => handlePrintPDF('cover_letter')}
                      variant="outline"
                      className="border-primary/40 text-primary hover:bg-primary/10 h-9 px-4 rounded-lg font-semibold flex items-center gap-2 bg-transparent"
                    >
                      <FileText className="w-4 h-4" />
                      Cover Letter PDF
                    </Button>
                  </>
                )}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/builder/${id}`)}
              className="border-primary/40 text-primary hover:bg-primary/10 h-9 px-4 rounded-lg font-semibold flex items-center gap-2 bg-transparent"
            >
              <Edit3 className="w-4 h-4" />
              Edit Resume
            </Button>

            <Button
              onClick={roastMyResume}
              disabled={loadingRoast}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-9 px-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {loadingRoast
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analyzing...</>
                : <><Sparkles className="w-4 h-4" />AI Critique</>}
            </Button>

            <Button
              onClick={() => router.push('/dashboard/battle')}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-9 px-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              <FileText className="w-4 h-4" /> Compare Resumes
            </Button>

            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 items-start transition-all duration-300 lg:grid-cols-12">
          
          {/* Left Column: Contact + Profile + Audio */}
          <div className="lg:col-span-4 space-y-4">
            <ContactBlock parsedData={parsedData} overrides={overrides} setOverrides={setOverrides} />
            <ProfileBlock parsedData={parsedData} />

            {/* ── Audio Enhancement Card ───────────────────────────────── */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Enhance with Audio</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Record or upload an audio clip of yourself talking about your experience. Gemini will transcribe it and merge it with your resume to create an optimized version.
              </p>

              {/* Guided Prompts Accordion */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Speech suggestions
                  </span>
                </div>
                {loadingSpeechSuggestions ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3.5 bg-muted-foreground/10 rounded animate-pulse w-full"></div>
                    <div className="h-3.5 bg-muted-foreground/10 rounded animate-pulse w-[95%]"></div>
                    <div className="h-3.5 bg-muted-foreground/10 rounded animate-pulse w-[85%]"></div>
                  </div>
                ) : speechSuggestions.length > 0 ? (
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
                    {speechSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">1.</span>
                      <span>Explain what you did on your daily job role (technologies, day-to-day workflow, team size).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">2.</span>
                      <span>Mention a specific challenge or feature you built, and describe the measurable outcome (e.g. <b>improved API speeds by 30%</b>).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">3.</span>
                      <span>State any hidden skills, certifications, or tools you know that aren't on your resume.</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setAudioDragging(true); }}
                onDragLeave={() => setAudioDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setAudioDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) { setAudioFile(f); setAudioBlob(null); }
                }}
                className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center gap-2 transition-all ${
                  audioDragging ? 'border-primary bg-primary/5' :
                  (audioFile || audioBlob) ? 'border-emerald-500/50 bg-emerald-500/5' :
                  'border-border bg-muted/40 hover:border-primary/50'
                }`}
              >
                {(audioFile || audioBlob) ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-semibold text-foreground text-center">
                      {audioFile ? audioFile.name : 'Recording ready'}
                    </p>
                    <button
                      onClick={() => { setAudioFile(null); setAudioBlob(null); }}
                      className="text-xs text-muted-foreground hover:text-rose-400 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center">
                      Drop audio here or <label className="text-primary cursor-pointer hover:underline">browse<input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioBlob(null); } }} /></label>
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">MP3 · WAV · M4A · WebM · OGG</p>
                  </>
                )}
              </div>

              {/* Record button */}
              <div className="flex gap-2">
                {!recording ? (
                  <button
                    id="audio-record-btn"
                    onClick={startRecording}
                    disabled={loadingAudio}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted text-sm font-semibold text-foreground hover:border-primary/50 hover:bg-muted/60 transition-all disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4 text-primary" /> Record Audio
                  </button>
                ) : (
                  <button
                    id="audio-stop-btn"
                    onClick={stopRecording}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition-all animate-pulse"
                  >
                    <StopCircle className="w-4 h-4" /> Stop Recording
                  </button>
                )}
              </div>

              {/* Process button */}
              {audioSuccess ? (
                <div className="flex items-center gap-2 justify-center text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Done! Opening builder…
                </div>
              ) : (
                <Button
                  id="audio-enhance-btn"
                  onClick={handleAudioEnhance}
                  disabled={(!audioFile && !audioBlob) || loadingAudio || recording}
                  className="w-full bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-white h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  {loadingAudio ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> Enhance with AI</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: ATS Score & Feedback */}
          <div className="lg:col-span-8 space-y-6">
            {!feedback ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm h-full flex flex-col justify-center min-h-[500px]">
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
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
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-12 rounded-md font-semibold"
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
                <div className="bg-card border border-border rounded-lg p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
                  
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
                      <CircularProgress value={feedback.score} color="#3ecf8e" size={130} strokeWidth={12} />
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
                        onClick={() => setActiveTab('mock_interview')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'mock_interview' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50'}`}
                      >
                        <Sparkles className="w-4 h-4 text-primary" /> Mock Interview
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
                      <button 
                        onClick={() => setActiveTab('cover_letter')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'cover_letter' ? 'bg-muted text-foreground flex items-center gap-2' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50 flex items-center gap-2'}`}
                      >
                        <FileText className="w-4 h-4" /> Cover Letter
                      </button>
                      <button 
                        onClick={() => setActiveTab('ats_match')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'ats_match' ? 'bg-muted text-foreground flex items-center gap-2' : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted/50 flex items-center gap-2'}`}
                      >
                        <Target className="w-4 h-4" /> ATS Matcher
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm min-h-[300px]">
                      
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
                              <Edit3 className="w-5 h-5 text-primary" /> AI Bullet Rewrites
                            </h3>
                            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
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

                      {activeTab === 'cover_letter' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" /> AI Cover Letter
                            </h3>
                            {coverLetter && (
                              <Button
                                onClick={() => handlePrintPDF('cover_letter')}
                                className="bg-primary hover:bg-primary/90 text-white shadow-sm h-9 px-4 rounded-lg font-semibold flex items-center gap-2 text-sm"
                              >
                                <Download className="w-4 h-4" />
                                Download PDF
                              </Button>
                            )}
                          </div>
                          
                          {!coverLetter ? (
                            <div className="text-center py-12 bg-muted rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
                              <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                              <h4 className="text-foreground font-medium mb-2">No Cover Letter Generated</h4>
                              <p className="text-sm text-muted-foreground max-w-md mb-6">
                                Provide a Job Description in the input section on the left and click the button below to generate a highly tailored cover letter.
                              </p>
                              <Button 
                                onClick={generateCoverLetter}
                                disabled={loadingCoverLetter || !jobDescription.trim()}
                                className="bg-primary hover:bg-primary/90 text-white shadow-sm h-10 px-6 rounded-lg font-semibold flex items-center gap-2"
                              >
                                {loadingCoverLetter ? (
                                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                                ) : (
                                  <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
                                )}
                              </Button>
                              {!jobDescription.trim() && (
                                <p className="text-xs text-amber-500 mt-3">Job Description is required to generate a cover letter.</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="relative">
                                <textarea
                                  value={coverLetter}
                                  onChange={(e) => setCoverLetter(e.target.value)}
                                  className="w-full h-[400px] p-6 bg-muted/50 border border-border rounded-xl text-sm leading-relaxed text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none custom-scrollbar resize-y"
                                />
                                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-border px-3 py-1 rounded-full flex items-center gap-2">
                                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground">Editable Preview</span>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button 
                                  variant="outline"
                                  onClick={generateCoverLetter}
                                  disabled={loadingCoverLetter}
                                  className="h-9 px-4 text-sm bg-transparent"
                                >
                                  {loadingCoverLetter ? 'Regenerating...' : 'Regenerate'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'mock_interview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-indigo-400" /> AI Mock Interview
                            </h3>
                          </div>
                          
                          {!mockInterview ? (
                            <div className="text-center py-12 bg-muted rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
                              <Sparkles className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                              <h4 className="text-foreground font-medium mb-2">No Mock Interview Generated</h4>
                              <p className="text-sm text-muted-foreground max-w-md mb-6">
                                Click the button below to generate a highly tailored mock interview based on your resume and target role.
                              </p>
                              <Button 
                                onClick={generateMockInterview}
                                disabled={loadingMockInterview}
                                className="bg-primary hover:bg-primary/90 text-white shadow-sm h-10 px-6 rounded-lg font-semibold flex items-center gap-2"
                              >
                                {loadingMockInterview ? (
                                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                                ) : (
                                  <><Sparkles className="w-4 h-4" /> Generate Mock Interview</>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-end mb-4">
                                <Button 
                                  variant="outline"
                                  onClick={generateMockInterview}
                                  disabled={loadingMockInterview}
                                  className="h-9 px-4 text-sm bg-transparent border-primary/40 text-primary hover:bg-primary/10"
                                >
                                  {loadingMockInterview ? 'Regenerating...' : 'Regenerate Questions'}
                                </Button>
                              </div>
                              <div className="grid gap-6">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {mockInterview.questions?.map((q: any, i: number) => {
                                  const isRecordingThis = recordingIndex === i;
                                  const hasRecording = !!recordedBlobs[i];
                                  const evaluation = evaluations[i];

                                  return (
                                    <div key={i} className="bg-muted border border-border rounded-xl p-6 shadow-sm space-y-6">
                                      <div className="flex items-start justify-between gap-4">
                                        <h4 className="text-foreground font-bold text-base leading-snug">
                                          <span className="text-primary mr-2">Q{i + 1}.</span> 
                                          {q.question}
                                        </h4>
                                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap capitalize">
                                          {q.type}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                                        {/* Left side: Hints */}
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Expected Answer Hints</p>
                                          <ul className="space-y-2">
                                            {q.expected_answer_hints?.map((hint: string, j: number) => (
                                              <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" />
                                                <span>{hint}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        {/* Right side: Practice Mic */}
                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
                                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Practice Answer</p>
                                          
                                          <div className="flex items-center gap-2">
                                            {!isRecordingThis ? (
                                              <Button
                                                onClick={() => startPracticeRecording(i)}
                                                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs py-2 rounded-lg font-semibold flex items-center gap-1.5 h-9"
                                              >
                                                <Mic className="w-3.5 h-3.5" /> Record Answer
                                              </Button>
                                            ) : (
                                              <Button
                                                onClick={stopPracticeRecording}
                                                className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs py-2 rounded-lg font-semibold flex items-center gap-1.5 h-9 animate-pulse"
                                              >
                                                <StopCircle className="w-3.5 h-3.5" /> Stop
                                              </Button>
                                            )}

                                            {hasRecording && !isRecordingThis && (
                                              <audio 
                                                src={URL.createObjectURL(recordedBlobs[i])} 
                                                controls 
                                                className="h-9 max-w-[150px] md:max-w-[200px]" 
                                              />
                                            )}
                                          </div>

                                          {hasRecording && !isRecordingThis && !evaluation?.loading && !evaluation?.feedback && (
                                            <Button
                                              onClick={() => evaluatePracticeAnswer(i, q.question, q.expected_answer_hints)}
                                              className="bg-primary hover:bg-primary/95 text-white text-xs font-semibold h-9 rounded-lg"
                                            >
                                              Submit Answer for AI Grading
                                            </Button>
                                          )}

                                          {evaluation?.loading && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground py-2">
                                              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                              Transcribing and grading answer...
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Evaluation feedback report block */}
                                      {evaluation && !evaluation.loading && evaluation.feedback && (
                                        <div className="mt-4 p-5 bg-primary/5 border border-primary/20 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                              <Sparkles className="w-4 h-4 text-primary" /> AI Evaluation Report
                                            </div>
                                            <span className="bg-primary/20 text-primary text-xs font-extrabold px-2.5 py-1 rounded-full border border-primary/20">
                                              Score: {evaluation.score}/10
                                            </span>
                                          </div>

                                          <div className="space-y-3">
                                            <div>
                                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Your Answer:</span>
                                              <p className="text-xs text-muted-foreground italic mt-0.5 leading-relaxed bg-muted p-2.5 rounded-lg">
                                                &quot;{evaluation.transcript}&quot;
                                              </p>
                                            </div>

                                            <div>
                                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Critique & Feedback:</span>
                                              <p className="text-xs text-foreground leading-relaxed mt-0.5">
                                                {evaluation.feedback}
                                              </p>
                                            </div>

                                            {evaluation.better_phrasing && evaluation.better_phrasing !== "N/A" && (
                                              <div className="pt-2 border-t border-primary/10">
                                                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Suggested Better Phrasing:</span>
                                                <p className="text-xs text-emerald-300 leading-relaxed mt-0.5 bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/10">
                                                  {evaluation.better_phrasing}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'ats_match' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" /> ATS Job Matcher & Keywords
                            </h3>
                          </div>

                          {!atsMatch ? (
                            <div className="text-center py-12 bg-muted rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
                              <Target className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                              <h4 className="text-foreground font-medium mb-2">Analyze Resume vs Job Description</h4>
                              <p className="text-sm text-muted-foreground max-w-md mb-6 text-center">
                                Evaluate your resume matching rate, find exactly which keywords are missing, and generate draft fixes.
                              </p>
                              
                              <div className="w-full max-w-md space-y-4 mb-6">
                                <div className="text-left space-y-1.5">
                                  <label className="text-xs font-semibold text-muted-foreground">Job Description</label>
                                  <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste job description here to check compatibility..."
                                    className="w-full h-32 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none custom-scrollbar"
                                  />
                                </div>
                              </div>

                              <Button
                                onClick={generateAtsMatch}
                                disabled={loadingAtsMatch || !jobDescription.trim()}
                                className="bg-primary hover:bg-primary/90 text-white shadow-sm h-10 px-6 rounded-lg font-semibold flex items-center gap-2"
                              >
                                {loadingAtsMatch ? (
                                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Running ATS Scan...</>
                                ) : (
                                  <><Sparkles className="w-4 h-4" /> Scan Compatibility</>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/50 border border-border rounded-2xl">
                                <CircularProgress value={atsMatch.match_score} color={atsMatch.match_score > 70 ? "#10B981" : atsMatch.match_score > 40 ? "#F59E0B" : "#EF4444"} size={110} strokeWidth={10} />
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                  <h4 className="text-lg font-bold text-foreground">ATS Match Compatibility</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your profile has a <span className="font-bold text-foreground">{atsMatch.match_score}%</span> keyword match rate for this role. Use the suggestions below to bridge the gap.
                                  </p>
                                  <Button
                                    variant="outline"
                                    onClick={() => setAtsMatch(null)}
                                    className="text-xs h-8 bg-transparent"
                                  >
                                    Reset / Re-run scan
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Matched Keywords */}
                                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> Matched Keywords
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {atsMatch.matched_keywords?.map((kw: string, i: number) => (
                                      <span key={i} className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                        {kw}
                                      </span>
                                    ))}
                                    {(!atsMatch.matched_keywords || atsMatch.matched_keywords.length === 0) && (
                                      <span className="text-xs text-muted-foreground italic">No matching keywords found.</span>
                                    )}
                                  </div>
                                </div>

                                {/* Missing Keywords */}
                                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                                  <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" /> Missing Keywords
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {atsMatch.missing_keywords?.map((kw: string, i: number) => (
                                      <span key={i} className="text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
                                        {kw}
                                      </span>
                                    ))}
                                    {(!atsMatch.missing_keywords || atsMatch.missing_keywords.length === 0) && (
                                      <span className="text-xs text-emerald-400 font-semibold italic">Perfect coverage! No missing keywords.</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Suggested Bullet Fixes */}
                              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-primary" /> Tailored Experience Bullets (Quick Fixes)
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Incorporate these bullets into your work experiences in the Resume Builder to automatically hit missing ATS keywords naturally.
                                </p>

                                <div className="space-y-3">
                                  {atsMatch.suggested_bullet_fixes?.map((bullet: string, i: number) => (
                                    <div key={i} className="flex gap-3 items-start justify-between bg-muted/40 p-4 rounded-xl border border-border">
                                      <p className="text-xs font-medium text-foreground leading-relaxed flex-1">
                                        • {bullet}
                                      </p>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(bullet);
                                          alert("Copied suggested bullet point to clipboard!");
                                        }}
                                        className="text-[10px] font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-2 py-1.5 rounded transition-all shrink-0 ml-3"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
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

    {/* ── AI Critique Panel ──────────────────────────────────────────────── */}
    {showRoast && (
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-violet-950/80 via-indigo-950/60 to-background border border-violet-500/30 rounded-2xl p-8 shadow-2xl shadow-violet-900/20 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">AI Critique Report</h2>
                <p className="text-xs text-muted-foreground">Comprehensive evaluation of content alignment, structure, and formatting.</p>
              </div>
            </div>
            <button onClick={() => setShowRoast(false)} className="text-muted-foreground/60 hover:text-foreground text-2xl font-light transition-colors">✕</button>
          </div>

          {loadingRoast ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border-2 border-violet-500/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
                </div>
              </div>
              <p className="text-violet-300 font-medium animate-pulse">Generating critique report...</p>
              <p className="text-muted-foreground text-sm">Analyzing experience alignment, language precision, and formatting standards</p>
            </div>
          ) : roast && (
            <div className="space-y-6">
              {/* Score */}
              <div className="flex items-center gap-6 p-5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="text-center shrink-0">
                  <div className="text-4xl font-black text-violet-400">{Math.max(0, 100 - (roast.cringe_score || 0))}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Optimization Rating</div>
                </div>
                <div className="flex-1 text-foreground font-medium text-base leading-relaxed">
                  &ldquo;{roast.overall_roast}&rdquo;
                </div>
              </div>

              {/* Section Critiques */}
              {roast.section_roasts?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed Section Critiques</h3>
                  {roast.section_roasts.map((item: {section: string; critique: string; fix: string}, i: number) => (
                    <div key={i} className="bg-muted/40 border border-border/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-bold text-sm">{item.section}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.critique}</p>
                      <p className="text-violet-400 text-xs font-semibold">Recommendation: {item.fix}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Steps */}
              {roast.redemption_arc?.length > 0 && (
                <div className="bg-violet-950/30 border border-violet-500/20 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400">Recommended Enhancements</h3>
                  <ul className="space-y-2">
                    {roast.redemption_arc.map((tip: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Hidden Print Targets */}
    <div className={printTarget === 'resume' ? 'block' : 'hidden'}>
      <ResumeHTML 
        parsedData={parsedData} 
        overrides={overrides} 
        aiRewrites={structData?.bullet_point_rewrites}
        structuredExperience={structData?.structured_experience}
        theme={pdfTheme}
        aiSummary={structData?.professional_summary}
        id="resume-html-content"
      />
    </div>
    
    <div className={printTarget === 'cover_letter' ? 'block' : 'hidden'}>
      <CoverLetterHTML 
        parsedData={parsedData}
        overrides={overrides}
        coverLetterText={coverLetter || ''}
        theme={pdfTheme}
        id="cover-letter-html-content"
      />
    </div>
    </>
  );
}
