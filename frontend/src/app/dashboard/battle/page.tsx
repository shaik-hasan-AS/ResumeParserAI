"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, FileText, Trophy, Zap, ShieldAlert, ThumbsUp } from "lucide-react";
import api from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cleanFilename, getResumeLabel } from "../page";

interface Resume {
  id: string;
  original_file_path: string;
  uploaded_at: string;
}

interface BattleResult {
  winner: number;
  winner_verdict: string;
  candidate_1_score: number;
  candidate_2_score: number;
  candidate_1_strengths: string[];
  candidate_2_strengths: string[];
  candidate_1_fatal_flaw: string;
  candidate_2_fatal_flaw: string;
  loser_redemption: string[];
}

function ResumeCard({
  slot,
  resumes,
  selected,
  onSelect,
  corner,
}: {
  slot: 1 | 2;
  resumes: Resume[];
  selected: string;
  onSelect: (id: string) => void;
  corner: "red" | "blue";
}) {
  const colors =
    corner === "red"
      ? { border: "border-red-500/40", bg: "bg-red-500/5", badge: "bg-red-500/20 text-red-300 border-red-500/30", title: "text-red-400" }
      : { border: "border-blue-500/40", bg: "bg-blue-500/5", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", title: "text-blue-400" };

  const selectedResume = resumes.find((r) => r.id === selected);

  return (
    <div className={`flex-1 rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 space-y-4 transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colors.badge}`}>
          {corner === "red" ? "Option 1" : "Option 2"}
        </span>
        <h2 className={`text-lg font-bold ${colors.title}`}>Candidate {slot}</h2>
      </div>

      {resumes.length === 0 ? (
        <p className="text-muted-foreground text-sm">Upload resumes first from your dashboard.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {resumes.map((r) => {
            const name = getResumeLabel(r.original_file_path) || r.id;
            const isSelected = r.id === selected;
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                  isSelected
                    ? `${colors.border} ${colors.bg} ${colors.title}`
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <p className="truncate">{name}</p>
                <p className="text-xs opacity-60 mt-0.5">
                  {new Date(r.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {selectedResume && (
        <div className={`px-3 py-2 rounded-lg border ${colors.badge} text-xs`}>
          ✓ Selected: {getResumeLabel(selectedResume.original_file_path)}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-foreground/5" />
        <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-2xl font-black" style={{ color }}>{score}</span>
    </div>
  );
}

export default function BattlePage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const searchParams = useSearchParams();
  const urlResume1 = searchParams.get('resume_id_1') || "";
  const urlResume2 = searchParams.get('resume_id_2') || "";
  const [selected1, setSelected1] = useState(urlResume1);
  const [selected2, setSelected2] = useState(urlResume2);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/resume/").then((r) => setResumes(r.data)).catch(console.error);
  }, []);

  const fight = async () => {
    if (!selected1 || !selected2) return setError("Select a resume for both slots.");
    if (selected1 === selected2) return setError("Choose two different resumes.");
    if (!jobDescription.trim()) return setError("Paste a job description to compare against.");
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post(
        `/api/resume/battle?resume_id_1=${selected1}&resume_id_2=${selected2}&job_description=${encodeURIComponent(jobDescription)}`
      );
      setResult(data);
    } catch (e: unknown) {
      setError((e as any)?.response?.data?.detail || "Comparison failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const winner = result ? (result.winner === 1 ? selected1 : selected2) : null;
  const winnerName = winner ? (getResumeLabel(resumes.find((r) => r.id === winner)?.original_file_path || "") || "Candidate") : "";
  const loserNum = result ? (result.winner === 1 ? 2 : 1) : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="rounded-full text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-violet-400" /> Resume Comparison
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Compare two resumes side-by-side against a job specification.</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Arena */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <ResumeCard slot={1} resumes={resumes} selected={selected1} onSelect={setSelected1} corner="red" />

          {/* Center VS */}
          <div className="flex flex-col items-center justify-center gap-4 py-4 lg:py-0 lg:w-24 shrink-0">
            <span className="text-2xl font-black text-foreground/20 tracking-widest">VS</span>
          </div>

          <ResumeCard slot={2} resumes={resumes} selected={selected2} onSelect={setSelected2} corner="blue" />
        </div>

        {/* Job Description */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" /> Job Description (required)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here. The more detail, the more accurate the comparison result..."
            rows={6}
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm resize-y"
          />
        </div>

        {error && (
          <p className="text-rose-400 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> {error}
          </p>
        )}

        {/* Compare Button */}
        <button
          onClick={fight}
          disabled={loading}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-lg tracking-wide shadow-xl shadow-violet-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
              Analyzing candidates...
            </>
          ) : (
            <>
              Compare Resumes
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">

            {/* Winner Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-violet-950/40 border border-violet-500/30 p-8 text-center space-y-3">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06)_0%,_transparent_70%)]" />
              <Trophy className="w-12 h-12 text-violet-400 mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Highest Match Score: Candidate {result.winner}</h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">{result.winner_verdict}</p>
              <p className="text-muted-foreground/60 text-xs">{winnerName}</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              {([1, 2] as const).map((n) => {
                const isWinner = result.winner === n;
                const score = n === 1 ? result.candidate_1_score : result.candidate_2_score;
                const color = isWinner ? "#a78bfa" : n === 1 ? "#f87171" : "#60a5fa";
                const name = getResumeLabel((n === 1 ? resumes.find((r) => r.id === selected1) : resumes.find((r) => r.id === selected2))?.original_file_path || "") || `Candidate ${n}`;
                return (
                  <div key={n} className={`rounded-2xl border p-6 space-y-4 ${isWinner ? "border-violet-500/30 bg-violet-500/5" : "border-border bg-card"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate {n}</p>
                        <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">{name}</p>
                      </div>
                      {isWinner ? <Trophy className="w-5 h-5 text-violet-400" /> : <FileText className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center gap-4">
                      <ScoreRing score={score} color={color} />
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Match Score</p>
                        <p>{score}/100</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Strengths</p>
                      {(n === 1 ? result.candidate_1_strengths : result.candidate_2_strengths).map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground leading-relaxed">• {s}</p>
                      ))}
                    </div>

                    {/* Fatal Flaw */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-bold text-rose-400 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Critical Gaps</p>
                      <p className="text-xs text-rose-300/80">{n === 1 ? result.candidate_1_fatal_flaw : result.candidate_2_fatal_flaw}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Loser Redemption */}
            {result.loser_redemption.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  Development Recommendations for Candidate {loserNum}
                </h3>
                <ol className="space-y-2">
                  {result.loser_redemption.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
