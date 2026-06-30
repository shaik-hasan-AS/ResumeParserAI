import React from 'react';
import { Mail, Phone, MapPin, Link2, Code2, Globe } from 'lucide-react';

const DEFAULT_SECTION_ORDER = ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'awards', 'languages', 'custom_sections'];

export interface ExperienceEntry {
  job_title: string;
  company: string;
  dates: string;
  bullet_points: string[];
}

export interface ResumeHTMLProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  overrides: Record<string, string>;
  aiRewrites?: Array<{ original: string; improved: string }>;
  structuredExperience?: ExperienceEntry[];
  theme?: 'modern' | 'harvard' | 'executive';
  aiSummary?: string;
  // An optional ID for printing targeting
  id?: string;
}

export default function ResumeHTML({
  parsedData,
  overrides,
  aiRewrites,
  structuredExperience,
  theme = 'modern',
  aiSummary,
  id = 'resume-html-content',
}: ResumeHTMLProps) {
  const getVal = (key: string) => overrides?.[key] || parsedData?.[key];

  const name = getVal('name');
  const email = getVal('email');
  const phone = getVal('phone');
  const linkedin = getVal('linkedin');
  const github = getVal('github');
  const location = getVal('location');

  const summary = aiSummary || getVal('summary');
  const projects = getVal('projects');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const certifications = getVal('certifications');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const languages = getVal('languages');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const awards = getVal('awards');

  const categorized = parsedData?.skills_categorized;
  const eduEntries = parsedData?.education_entries || [];

  let experience = parsedData?.experience;
  if (experience && aiRewrites && aiRewrites.length > 0) {
    aiRewrites.forEach((rewrite) => {
      if (rewrite.original && rewrite.improved) {
        experience = experience.replace(rewrite.original, rewrite.improved);
      }
    });
  }

  const checkIsBullet = (sanitized: string) => {
    if (!sanitized) return false;
    if (/^[•\-\*\,➢▪●○❖·‚¸\–\—\~>+，]/.test(sanitized)) return true;
    const firstChar = sanitized.charAt(0);
    const isLetter = firstChar.toUpperCase() !== firstChar.toLowerCase();
    const isDigit = /[0-9]/.test(firstChar);
    const isQuoteOrBracket = /["'\(\)\[\]\{\}]/.test(firstChar);
    return !isLetter && !isDigit && !isQuoteOrBracket;
  };

  const getCleanLine = (sanitized: string) => {
    if (checkIsBullet(sanitized)) return sanitized.substring(1).trim();
    return sanitized;
  };

  const preProcessLines = (text: string) => {
    if (!text) return [];
    const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const combinedLines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const sanitized = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
      const isBullet = checkIsBullet(sanitized);

      if (isBullet) {
        if (currentLine) combinedLines.push(currentLine);
        currentLine = line;
      } else {
        if (!currentLine) {
          combinedLines.push(line);
        } else {
          const prevSanitized = currentLine.trim();
          const endsWithPunctuation = /[.!?]$/.test(prevSanitized);
          const firstChar = sanitized.charAt(0);
          const startsWithLowercase =
            firstChar &&
            firstChar.toLowerCase() === firstChar &&
            firstChar.toUpperCase() !== firstChar;

          if (!endsWithPunctuation || startsWithLowercase) {
            currentLine += ' ' + line;
          } else {
            combinedLines.push(currentLine);
            currentLine = '';
            combinedLines.push(line);
          }
        }
      }
    }
    if (currentLine) combinedLines.push(currentLine);
    return combinedLines;
  };

  const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');
  const labels = parsedData?.section_labels || {};
  const isVisible = (sectionName: string) => parsedData?.visible_sections?.[sectionName] !== false;

  const contactItems = [];
  if (email) contactItems.push({ type: 'email', val: email, icon: <Mail size={12} /> });
  if (phone) contactItems.push({ type: 'phone', val: phone, icon: <Phone size={12} /> });
  if (location) contactItems.push({ type: 'location', val: location, icon: <MapPin size={12} /> });
  if (linkedin) contactItems.push({ type: 'linkedin', val: linkedin, icon: <Link2 size={12} />, link: true });
  if (github) {
    const isGithub = github.toLowerCase().includes('github.com');
    const isLinkedin = github.toLowerCase().includes('linkedin.com');
    let icon = <Globe size={12} />;
    if (isGithub) icon = <Code2 size={12} />;
    else if (isLinkedin) icon = <Link2 size={12} />;
    contactItems.push({ type: 'github', val: github, icon, link: true });
  }

  // --- Themes configuration ---
  // To ensure the print works seamlessly and MS Word conversion looks decent, 
  // we rely on standard inline styles combined with predictable standard HTML tags 
  // rather than solely complex tailwind classes (Word doesn't run Tailwind).
  
  const getThemeVars = () => {
    switch (theme) {
      case 'harvard':
        return {
          fontFamily: '"Times New Roman", Times, serif',
          color: '#000000',
          headerAlign: 'center' as const,
          nameSize: '24pt',
          nameWeight: 'bold',
          nameTransform: 'none' as const,
          nameColor: '#000000',
          sectionTitleSize: '12pt',
          sectionTitleWeight: 'bold',
          sectionTitleTransform: 'uppercase' as const,
          sectionTitleColor: '#000000',
          sectionTitleBorder: '1px solid #000000',
          fontSize: '11pt',
          headerBg: 'transparent',
          headerColor: '#000000',
          contactJustify: 'center' as const,
          showContactIcons: false,
        };
      case 'executive':
        return {
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#111827',
          headerAlign: 'left' as const,
          nameSize: '24pt',
          nameWeight: 'bold',
          nameTransform: 'none' as const,
          nameColor: '#ffffff',
          sectionTitleSize: '11pt',
          sectionTitleWeight: 'bold',
          sectionTitleTransform: 'uppercase' as const,
          sectionTitleColor: '#4F46E5',
          sectionTitleBorder: '2px solid #4F46E5',
          fontSize: '10pt',
          headerBg: '#1E3A5F',
          headerColor: '#CBD5E1',
          contactJustify: 'flex-end' as const,
          showContactIcons: true,
        };
      case 'modern':
      default:
        return {
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#111827',
          headerAlign: 'center' as const,
          nameSize: '22pt',
          nameWeight: 'bold',
          nameTransform: 'uppercase' as const,
          nameColor: '#111827',
          sectionTitleSize: '12pt',
          sectionTitleWeight: 'bold',
          sectionTitleTransform: 'uppercase' as const,
          sectionTitleColor: '#111827',
          sectionTitleBorder: '1px solid #D1D5DB',
          fontSize: '10pt',
          headerBg: 'transparent',
          headerColor: '#4B5563',
          contactJustify: 'center' as const,
          showContactIcons: true,
        };
    }
  };

  const t = getThemeVars();

  // Helper for raw bullet rendering
  const renderRawBullets = (text: string) => {
    if (!text) return null;
    const lines = preProcessLines(text);
    return (
      <ul style={{ margin: 0, paddingLeft: '1.5em', listStyleType: 'disc' }}>
        {lines.map((line, i) => {
          const sanitizedLine = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
          const isBullet = checkIsBullet(sanitizedLine);
          const cleanLine = getCleanLine(sanitizedLine);
          if (isBullet) {
            return <li key={i} style={{ marginBottom: '4px', lineHeight: 1.4 }}>{cleanLine}</li>;
          }
          return <div key={i} style={{ marginBottom: '4px', lineHeight: 1.4, marginLeft: '-1.5em' }}>{cleanLine}</div>;
        })}
      </ul>
    );
  };

  // Helper for projects rendering
  const renderProjects = (text: string) => {
    if (!text) return null;
    const lines = preProcessLines(text);
    const elements: React.ReactNode[] = [];
    let currentBullets: string[] = [];

    const flushBullets = () => {
      if (currentBullets.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ margin: 0, paddingLeft: '1.5em', listStyleType: 'disc' }}>
            {currentBullets.map((b, idx) => (
              <li key={idx} style={{ marginBottom: '4px', lineHeight: 1.4 }}>{b}</li>
            ))}
          </ul>
        );
        currentBullets = [];
      }
    };

    lines.forEach((line, i) => {
      const sanitizedLine = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
      const isBullet = checkIsBullet(sanitizedLine);
      const cleanLine = getCleanLine(sanitizedLine);

      if (isBullet) {
        currentBullets.push(cleanLine);
      } else {
        flushBullets();
        const prevLine = i > 0 ? lines[i - 1] : null;
        const prevIsBullet = prevLine ? checkIsBullet(prevLine.replace(/^[\s\u200B-\u200D\uFEFF]+/, '')) : false;
        const isAllCaps = cleanLine === cleanLine.toUpperCase() && cleanLine.replace(/[^A-Z]/g, '').length > 3;

        if (i === 0 || prevIsBullet || isAllCaps) {
          elements.push(
            <div key={i} style={{ fontWeight: 'bold', marginTop: i > 0 ? '12px' : 0, marginBottom: '2px' }}>
              {cleanLine}
            </div>
          );
        } else {
          elements.push(
            <div key={i} style={{ fontStyle: 'italic', marginBottom: '6px' }}>
              {cleanLine}
            </div>
          );
        }
      }
    });
    flushBullets();
    return elements;
  };

  return (
    <div 
      id={id}
      className="resume-print-container"
      style={{
        fontFamily: t.fontFamily,
        color: t.color,
        fontSize: t.fontSize,
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: theme === 'executive' ? '0' : '40px 48px',
        boxSizing: 'border-box',
        lineHeight: 1.5,
      }}
    >
      {/* HEADER */}
      {theme === 'executive' ? (
        <div style={{
          backgroundColor: t.headerBg,
          color: t.headerColor,
          padding: '28px 48px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div>
            {name && <div style={{ fontSize: t.nameSize, fontWeight: t.nameWeight, color: t.nameColor, textTransform: t.nameTransform, marginBottom: '2px' }}>{name}</div>}
            {location && <div style={{ fontSize: '10pt', color: '#94A3B8', marginTop: '2px' }}>{location}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
             {email && <div style={{ fontSize: '10pt' }}>{email}</div>}
             {phone && <div style={{ fontSize: '10pt' }}>{phone}</div>}
             {linkedin && <div><a href={linkedin} style={{ color: '#93C5FD', textDecoration: 'none', fontSize: '10pt' }}>{cleanUrl(linkedin)}</a></div>}
             {github && <div><a href={github} style={{ color: '#93C5FD', textDecoration: 'none', fontSize: '10pt' }}>{cleanUrl(github)}</a></div>}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: t.headerAlign, marginBottom: '24px' }}>
          {name && <div style={{ fontSize: t.nameSize, fontWeight: t.nameWeight, color: t.nameColor, textTransform: t.nameTransform, marginBottom: '8px' }}>{name}</div>}
          {contactItems.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: t.contactJustify, alignItems: 'center', gap: theme === 'harvard' ? '4px' : '12px' }}>
              {contactItems.map((item, index) => (
                <React.Fragment key={index}>
                  <div style={{ display: 'flex', alignItems: 'center', color: t.headerColor, fontSize: '10pt' }}>
                    {t.showContactIcons && <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
                    {item.link ? (
                      <a href={item.val} style={{ color: t.headerColor, textDecoration: 'none' }}>{cleanUrl(item.val)}</a>
                    ) : (
                      <span>{item.val}</span>
                    )}
                  </div>
                  {theme === 'harvard' && index < contactItems.length - 1 && (
                    <span style={{ color: t.headerColor, margin: '0 4px', fontSize: '10pt' }}>|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTIONS */}
      <div style={{ padding: theme === 'executive' ? '0 48px' : '0' }}>
        {(parsedData?.section_order || DEFAULT_SECTION_ORDER).map((sectionKey: string) => {
          if (sectionKey === 'summary') {
            if (!isVisible('summary') || !summary || !summary.trim()) return null;
            return (
              <div key="summary" style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: t.sectionTitleSize, fontWeight: t.sectionTitleWeight, textTransform: t.sectionTitleTransform, color: t.sectionTitleColor, borderBottom: t.sectionTitleBorder, paddingBottom: '4px', marginBottom: '10px' }}>
                  {labels.summary || 'Professional Summary'}
                </div>
                {renderRawBullets(summary)}
              </div>
            );
          }

          if (sectionKey === 'experience') {
            const hasExp = structuredExperience?.length ? structuredExperience.length > 0 : experience;
            if (!isVisible('experience') || !hasExp) return null;
            return (
              <div key="experience" style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: t.sectionTitleSize, fontWeight: t.sectionTitleWeight, textTransform: t.sectionTitleTransform, color: t.sectionTitleColor, borderBottom: t.sectionTitleBorder, paddingBottom: '4px', marginBottom: '10px' }}>
                  {labels.experience || 'Experience'}
                </div>
                {structuredExperience && structuredExperience.length > 0 ? (
                  structuredExperience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <div style={{ fontWeight: 'bold' }}>{exp.job_title}</div>
                        <div style={{ fontSize: '0.9em' }}>{exp.dates}</div>
                      </div>
                      <div style={{ fontStyle: theme === 'modern' || theme === 'executive' ? 'italic' : 'normal', marginBottom: '6px' }}>{exp.company}</div>
                      <ul style={{ margin: 0, paddingLeft: '1.5em', listStyleType: 'disc' }}>
                        {exp.bullet_points.map((bullet, j) => (
                          <li key={j} style={{ marginBottom: '4px', lineHeight: 1.4 }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  renderRawBullets(experience)
                )}
              </div>
            );
          }

          if (sectionKey === 'education') {
            if (!isVisible('education') || (!eduEntries.length && !parsedData?.education)) return null;
            return (
              <div key="education" style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: t.sectionTitleSize, fontWeight: t.sectionTitleWeight, textTransform: t.sectionTitleTransform, color: t.sectionTitleColor, borderBottom: t.sectionTitleBorder, paddingBottom: '4px', marginBottom: '10px' }}>
                  {labels.education || 'Education'}
                </div>
                {eduEntries.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  eduEntries.map((entry: any, i: number) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <div style={{ fontWeight: 'bold' }}>{entry.degree}</div>
                        {entry.year && <div style={{ fontSize: '0.9em' }}>{entry.year}</div>}
                      </div>
                      <div>{entry.institution}</div>
                    </div>
                  ))
                ) : (
                  renderRawBullets(parsedData.education)
                )}
              </div>
            );
          }

          if (sectionKey === 'projects') {
            if (!isVisible('projects') || !projects || !projects.trim()) return null;
            return (
              <div key="projects" style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: t.sectionTitleSize, fontWeight: t.sectionTitleWeight, textTransform: t.sectionTitleTransform, color: t.sectionTitleColor, borderBottom: t.sectionTitleBorder, paddingBottom: '4px', marginBottom: '10px' }}>
                  {labels.projects || 'Projects'}
                </div>
                {renderProjects(projects)}
              </div>
            );
          }

          if (sectionKey === 'skills') {
            if (!isVisible('skills') || !categorized) return null;
            return (
              <div key="skills" style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: t.sectionTitleSize, fontWeight: t.sectionTitleWeight, textTransform: t.sectionTitleTransform, color: t.sectionTitleColor, borderBottom: t.sectionTitleBorder, paddingBottom: '4px', marginBottom: '10px' }}>
                  {labels.skills || 'Skills'}
                </div>
                {categorized.technical?.length > 0 && (
                  <div style={{ display: 'flex', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 'bold', width: '80px', flexShrink: 0 }}>Technical:</div>
                    <div>{categorized.technical.join(', ')}</div>
                  </div>
                )}
                {categorized.tools?.length > 0 && (
                  <div style={{ display: 'flex', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 'bold', width: '80px', flexShrink: 0 }}>Tools:</div>
                    <div>{categorized.tools.join(', ')}</div>
                  </div>
                )}
                {categorized.soft?.length > 0 && (
                  <div style={{ display: 'flex', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 'bold', width: '80px', flexShrink: 0 }}>Soft Skills:</div>
                    <div>{categorized.soft.join(', ')}</div>
                  </div>
                )}
              </div>
            );
          }
          
          if (sectionKey === 'custom_sections') {
             const cSecs = parsedData?.custom_sections || [];
             if (!cSecs.length) return null;
             return (
               <React.Fragment key="custom_sections">
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {cSecs.map((sec: any, idx: number) => {
                   const keyStr = sec.id ? `custom_${sec.id}` : `custom_${idx}`;
                   if (!isVisible(keyStr) || !sec.content?.trim()) return null;
                   return (
                     <div key={keyStr} style={{ marginBottom: '18px' }}>
                        <div style={{ fontSize: t.sectionTitleSize, fontWeight: t.sectionTitleWeight, textTransform: t.sectionTitleTransform, color: t.sectionTitleColor, borderBottom: t.sectionTitleBorder, paddingBottom: '4px', marginBottom: '10px' }}>
                          {sec.title}
                        </div>
                        {renderRawBullets(sec.content)}
                     </div>
                   )
                 })}
               </React.Fragment>
             );
          }
          
          return null;
        })}
      </div>
    </div>
  );
}
