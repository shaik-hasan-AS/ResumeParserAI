"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, Trash2, Sparkles, Loader2, Eye, EyeOff, ArrowUp, ArrowDown, Edit2 } from 'lucide-react';
import api from '@/lib/api';
import dynamic from 'next/dynamic';
import ResumePDF from '@/components/ResumePDF';
import { useResumeStore } from '@/store/useResumeStore';

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), { ssr: false });

const RewritableTextarea = ({ value, onChange, placeholder, context, className }: { value: string, onChange: (val: string) => void, placeholder: string, context: string, className?: string }) => {
  const [rewriting, setRewriting] = useState(false);

  const handleRewrite = async () => {
    if (!value.trim()) return;
    setRewriting(true);
    try {
      const res = await api.post('/api/resume/rewrite', { text: value, context });
      onChange(res.data.text);
    } catch (e) {
      console.error(e);
      alert("Failed to rewrite.");
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className || "w-full h-24 px-3 py-2 border border-border rounded-lg bg-muted text-sm custom-scrollbar"}
      />
      <button
        onClick={handleRewrite}
        disabled={rewriting}
        title="Rewrite with AI"
        className="absolute bottom-3 right-3 p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
      >
        {rewriting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      </button>
    </div>
  );
};

const ExperienceItem = ({ exp, index, total }: { exp: any, index: number, total: number }) => {
  const { updateExperience, reorderExperiences, parsedData } = useResumeStore();

  const handleRemove = () => {
    const exps = [...(parsedData.structured_experience || [])];
    exps.splice(index, 1);
    useResumeStore.getState().updateField('structured_experience', exps);
  };

  const moveUp = () => {
    if (index > 0) reorderExperiences(index, index - 1);
  };

  const moveDown = () => {
    if (index < total - 1) reorderExperiences(index, index + 1);
  };

  return (
    <div className="bg-muted p-4 rounded-xl border border-border mb-3 flex gap-3 group">
      <div className="flex flex-col gap-1 mt-2 text-muted-foreground shrink-0">
        <button onClick={moveUp} disabled={index === 0} className="hover:text-foreground hover:bg-muted-foreground/10 p-1 rounded-md disabled:opacity-30">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button onClick={moveDown} disabled={index === total - 1} className="hover:text-foreground hover:bg-muted-foreground/10 p-1 rounded-md disabled:opacity-30">
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={exp.job_title}
            onChange={(e) => updateExperience(index, { ...exp, job_title: e.target.value })}
            placeholder="Job Title"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
          <button onClick={handleRemove} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={exp.company}
            onChange={(e) => updateExperience(index, { ...exp, company: e.target.value })}
            placeholder="Company"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
          <input
            type="text"
            value={exp.dates}
            onChange={(e) => updateExperience(index, { ...exp, dates: e.target.value })}
            placeholder="Dates (e.g. Jan 2020 - Present)"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
        </div>
        <RewritableTextarea
          value={(exp.bullet_points || []).join('\n')}
          onChange={(val) => updateExperience(index, { ...exp, bullet_points: val.split('\n') })}
          placeholder="Bullet points (one per line)"
          context="Experience bullet points"
        />
      </div>
    </div>
  );
};

const EducationItem = ({ edu, index, total }: { edu: any, index: number, total: number }) => {
  const { updateEducation, reorderEducations, parsedData } = useResumeStore();

  const handleRemove = () => {
    const edus = [...(parsedData.education_entries || [])];
    edus.splice(index, 1);
    useResumeStore.getState().updateField('education_entries', edus);
  };

  const moveUp = () => {
    if (index > 0) reorderEducations(index, index - 1);
  };

  const moveDown = () => {
    if (index < total - 1) reorderEducations(index, index + 1);
  };

  return (
    <div className="bg-muted p-4 rounded-xl border border-border mb-3 flex gap-3 group">
      <div className="flex flex-col gap-1 mt-2 text-muted-foreground shrink-0">
        <button onClick={moveUp} disabled={index === 0} className="hover:text-foreground hover:bg-muted-foreground/10 p-1 rounded-md disabled:opacity-30">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button onClick={moveDown} disabled={index === total - 1} className="hover:text-foreground hover:bg-muted-foreground/10 p-1 rounded-md disabled:opacity-30">
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={edu.degree || ''}
            onChange={(e) => updateEducation(index, { ...edu, degree: e.target.value })}
            placeholder="Degree / Certificate"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
          <button onClick={handleRemove} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={edu.institution || ''}
            onChange={(e) => updateEducation(index, { ...edu, institution: e.target.value })}
            placeholder="Institution"
            className="flex-[2] px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
          <input
            type="text"
            value={edu.year || ''}
            onChange={(e) => updateEducation(index, { ...edu, year: e.target.value })}
            placeholder="Year"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );
};

const CustomSectionItem = ({ sec, index, total }: { sec: any, index: number, total: number }) => {
  const { updateCustomSection, reorderCustomSections, parsedData, toggleSectionVisibility } = useResumeStore();
  const visibilityKey = sec.id ? `custom_${sec.id}` : `custom_${index}`;
  const isVisible = parsedData.visible_sections?.[visibilityKey] !== false;

  const handleRemove = () => {
    const secs = [...(parsedData.custom_sections || [])];
    secs.splice(index, 1);
    useResumeStore.getState().updateField('custom_sections', secs);
  };

  const moveUp = () => {
    if (index > 0) reorderCustomSections(index, index - 1);
  };

  const moveDown = () => {
    if (index < total - 1) reorderCustomSections(index, index + 1);
  };

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <input
          type="text"
          value={sec.title}
          onChange={(e) => updateCustomSection(index, { ...sec, title: e.target.value })}
          placeholder="Custom Section Title (e.g. Strengths)"
          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-semibold"
        />
        <div className="flex items-center gap-2">
          <button onClick={moveUp} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={moveDown} disabled={index === total - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button onClick={handleRemove} className="text-rose-500 hover:text-rose-600">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => toggleSectionVisibility(visibilityKey)} className="text-muted-foreground hover:text-foreground">
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <RewritableTextarea
        value={sec.content}
        onChange={(val) => updateCustomSection(index, { ...sec, content: val })}
        placeholder={`Content for ${sec.title || 'custom section'}`}
        context={`Custom resume section: ${sec.title}`}
      />
    </div>
  );
};


export default function BuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { parsedData, setParsedData, updateField, reorderExperiences } = useResumeStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toggleSectionVisibility } = useResumeStore();
  const isVisible = (section: string) => parsedData.visible_sections?.[section] !== false;

  const [theme, setTheme] = useState<'modern' | 'harvard' | 'executive'>('modern');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/resume/${id}/parsed`);
        const data = response.data.parsed_json || {};
        
        // Make sure arrays exist
        if (!data.structured_experience) data.structured_experience = [];
        if (!data.education_entries) data.education_entries = [];
        
        setParsedData(data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, setParsedData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/resume/${id}/parsed`, { parsed_json: parsedData });
      alert("Resume saved successfully!");
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    const exps = [...(parsedData.structured_experience || [])];
    exps.push({ id: crypto.randomUUID(), job_title: '', company: '', dates: '', bullet_points: [] });
    updateField('structured_experience', exps);
  };

  const addEducation = () => {
    const edus = [...(parsedData.education_entries || [])];
    edus.push({ id: crypto.randomUUID(), degree: '', institution: '', year: '' });
    updateField('education_entries', edus);
  };

  const addCustomSection = () => {
    const secs = [...(parsedData.custom_sections || [])];
    secs.push({ id: crypto.randomUUID(), title: 'New Section', content: '' });
    updateField('custom_sections', secs);
  };

  const experienceItems = parsedData.structured_experience || [];
  const educationItems = parsedData.education_entries || [];
  const customSectionsItems = parsedData.custom_sections || [];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans h-screen overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-border bg-card z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/resume/${id}`)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Interactive Resume Builder</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white flex gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Editor */}
        <div className="w-1/2 p-6 overflow-y-auto custom-scrollbar border-r border-border bg-background space-y-8 pb-24">
          
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={parsedData.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="Full Name" className="px-3 py-2 border border-border rounded-lg bg-muted text-sm" />
              <input type="text" value={parsedData.email || ''} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" className="px-3 py-2 border border-border rounded-lg bg-muted text-sm" />
              <input type="text" value={parsedData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className="px-3 py-2 border border-border rounded-lg bg-muted text-sm" />
              <input type="text" value={parsedData.location || ''} onChange={(e) => updateField('location', e.target.value)} placeholder="Location (City, State)" className="px-3 py-2 border border-border rounded-lg bg-muted text-sm" />
              <input type="text" value={parsedData.linkedin || ''} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="LinkedIn URL" className="px-3 py-2 border border-border rounded-lg bg-muted text-sm" />
              <input type="text" value={parsedData.github || ''} onChange={(e) => updateField('github', e.target.value)} placeholder="Portfolio / Link URL" className="px-3 py-2 border border-border rounded-lg bg-muted text-sm" />
            </div>
            <RewritableTextarea
              value={parsedData.summary || ''}
              onChange={(val) => updateField('summary', val)}
              placeholder="Professional Summary"
              context="Professional Summary"
            />
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={parsedData.section_labels?.experience || 'Experience'}
                onChange={(e) => useResumeStore.getState().updateSectionLabel('experience', e.target.value)}
                className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-border focus:outline-none placeholder-muted-foreground w-1/2"
              />
              <Button variant="outline" size="sm" onClick={addExperience} className="gap-2">
                <Plus className="w-4 h-4" /> Add Role
              </Button>
            </div>
            <div>
              {experienceItems.map((exp: any, index: number) => (
                <ExperienceItem key={exp.id || index} exp={exp} index={index} total={experienceItems.length} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold">Additional Sections</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <input
                    type="text"
                    value={parsedData.section_labels?.education || 'Education'}
                    onChange={(e) => useResumeStore.getState().updateSectionLabel('education', e.target.value)}
                    className="text-sm font-semibold text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-border focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={addEducation} className="h-6 text-xs px-2">
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                    <button onClick={() => toggleSectionVisibility('education')} className="text-muted-foreground hover:text-foreground">
                      {isVisible('education') ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {educationItems.length > 0 && (
                  <div className="mb-3">
                    {educationItems.map((edu: any, index: number) => (
                      <EducationItem key={edu.id || index} edu={edu} index={index} total={educationItems.length} />
                    ))}
                  </div>
                )}
                <RewritableTextarea
                  value={parsedData.education || ''}
                  onChange={(val) => updateField('education', val)}
                  placeholder="Additional Education Details (Optional)"
                  context="Education section"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <input
                    type="text"
                    value={parsedData.section_labels?.projects || 'Projects'}
                    onChange={(e) => useResumeStore.getState().updateSectionLabel('projects', e.target.value)}
                    className="text-sm font-semibold text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-border focus:outline-none"
                  />
                  <button onClick={() => toggleSectionVisibility('projects')} className="text-muted-foreground hover:text-foreground">
                    {isVisible('projects') ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <RewritableTextarea
                  value={parsedData.projects || ''}
                  onChange={(val) => updateField('projects', val)}
                  placeholder="Projects Details"
                  context="Projects section"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <input
                    type="text"
                    value={parsedData.section_labels?.certifications || 'Certifications'}
                    onChange={(e) => useResumeStore.getState().updateSectionLabel('certifications', e.target.value)}
                    className="text-sm font-semibold text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-border focus:outline-none"
                  />
                  <button onClick={() => toggleSectionVisibility('certifications')} className="text-muted-foreground hover:text-foreground">
                    {isVisible('certifications') ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <RewritableTextarea
                  value={parsedData.certifications || ''}
                  onChange={(val) => updateField('certifications', val)}
                  placeholder="Certifications Details"
                  context="Certifications section"
                  className="w-full h-20 px-3 py-2 border border-border rounded-lg bg-muted text-sm custom-scrollbar"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center border-t border-border pt-6">
              <h2 className="text-lg font-bold">Custom Sections</h2>
              <Button variant="outline" size="sm" onClick={addCustomSection} className="gap-2">
                <Plus className="w-4 h-4" /> Add Custom Section
              </Button>
            </div>
            {customSectionsItems.length > 0 && (
              <div className="space-y-4">
                {customSectionsItems.map((sec: any, index: number) => (
                  <CustomSectionItem key={sec.id || index} sec={sec} index={index} total={customSectionsItems.length} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Pane: PDF Preview */}
        <div className="w-1/2 bg-muted/30 p-4 h-full relative flex flex-col">
          {/* Theme Selector */}
          <div className="flex justify-center gap-2 mb-4 shrink-0">
            {(['modern', 'harvard', 'executive'] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
          
          <PDFViewer width="100%" height="100%" className="rounded-xl shadow-xl border border-border flex-1">
            <ResumePDF 
              parsedData={parsedData} 
              overrides={{ name: '', email: '', phone: '', linkedin: '', github: '', location: '' }}
              theme={theme}
              structuredExperience={experienceItems}
            />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
