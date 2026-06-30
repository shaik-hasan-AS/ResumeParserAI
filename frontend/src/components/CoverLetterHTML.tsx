import React from 'react';
import { Mail, Phone, MapPin, Link2, Code2, Globe } from 'lucide-react';

export interface CoverLetterHTMLProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  overrides: Record<string, string>;
  coverLetterText: string;
  theme?: 'modern' | 'harvard' | 'executive';
  id?: string;
}

export default function CoverLetterHTML({
  parsedData,
  overrides,
  coverLetterText,
  theme = 'modern',
  id = 'cover-letter-html-content',
}: CoverLetterHTMLProps) {
  const getVal = (key: string) => overrides?.[key] || parsedData?.[key];

  const name = getVal('name');
  const email = getVal('email');
  const phone = getVal('phone');
  const linkedin = getVal('linkedin');
  const github = getVal('github');
  const location = getVal('location');

  const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');

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
          fontSize: '10pt',
          headerBg: 'transparent',
          headerColor: '#4B5563',
          contactJustify: 'center' as const,
          showContactIcons: true,
        };
    }
  };

  const t = getThemeVars();

  const paragraphs = coverLetterText
    ? coverLetterText.split('\n').map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <div
      id={id}
      className="cover-letter-print-container"
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

      {/* CONTENT */}
      <div style={{ padding: theme === 'executive' ? '0 48px' : '0' }}>
        {paragraphs.map((p, i) => (
          <div key={i} style={{ marginBottom: '16px', lineHeight: 1.6 }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
