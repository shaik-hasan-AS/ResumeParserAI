import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Svg, Path } from '@react-pdf/renderer';

// --- Icons ---
const iconColor = "#4B5563";
const IconEmail = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);
const IconPhone = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);
const IconMapPin = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </Svg>
);
const IconLinkedin = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <Path d="M2 9h4v12H2z" />
    <Path d="M4 2a2 2 0 1 0 0 4 2 2 0 1 0 0-4z" />
  </Svg>
);
const IconGithub = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </Svg>
);

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    padding: '40px 48px',
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    color: '#111827',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9.5,
    color: '#4B5563',
  },
  contactIcon: {
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: '#4B5563',
    textDecoration: 'none',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 4,
    marginBottom: 10,
  },
  entryBlock: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  dates: {
    fontSize: 9.5,
    color: '#4B5563',
  },
  company: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: '#374151',
    marginBottom: 6,
  },
  degree: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  institution: {
    fontSize: 10,
    color: '#374151',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: '#4B5563',
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#374151',
  },
  textBlock: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 4,
  },
  skillsGroup: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  skillsLabel: {
    width: 70,
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  skillsText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#374151',
  }
});

interface ExperienceEntry {
  job_title: string;
  company: string;
  dates: string;
  bullet_points: string[];
}

interface ResumePDFProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  overrides: Record<string, string>;
  aiRewrites?: Array<{ original: string; improved: string }>;
  structuredExperience?: ExperienceEntry[];
}

const ResumePDF: React.FC<ResumePDFProps> = ({ parsedData, overrides, aiRewrites, structuredExperience }) => {
  const getVal = (key: string) => overrides[key] || parsedData?.[key];

  const name = getVal('name');
  const email = getVal('email');
  const phone = getVal('phone');
  const linkedin = getVal('linkedin');
  const github = getVal('github');
  const location = getVal('location');

  const summary = getVal('summary');
  const projects = getVal('projects');
  const certifications = getVal('certifications');
  const languages = getVal('languages');
  const awards = getVal('awards');

  const categorized = parsedData?.skills_categorized;
  const eduEntries = parsedData?.education_entries || [];
  
  // Apply AI rewrites to experience text if available
  let experience = parsedData?.experience;
  if (experience && aiRewrites && aiRewrites.length > 0) {
    aiRewrites.forEach(rewrite => {
      if (rewrite.original && rewrite.improved) {
        experience = experience.replace(rewrite.original, rewrite.improved);
      }
    });
  }

  const checkIsBullet = (sanitized: string) => {
    if (!sanitized) return false;
    if (/^[•\-\*\,➢▪●○❖·‚¸\–\—\~>+，]/.test(sanitized)) return true;
    
    // Fallback for weird unicode commas/symbols: 
    // If the first char is not a letter (has no case), not a digit, and not a bracket/quote, it's a bullet.
    const firstChar = sanitized.charAt(0);
    const isLetter = firstChar.toUpperCase() !== firstChar.toLowerCase();
    const isDigit = /[0-9]/.test(firstChar);
    const isQuoteOrBracket = /["'\(\)\[\]\{\}]/.test(firstChar);
    
    return !isLetter && !isDigit && !isQuoteOrBracket;
  };

  const getCleanLine = (sanitized: string) => {
    if (checkIsBullet(sanitized)) {
      // Remove the first character and any following space
      return sanitized.substring(1).trim();
    }
    return sanitized;
  };

  const preProcessLines = (text: string) => {
    if (!text) return [];
    const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const combinedLines: string[] = [];
    
    let currentLine = "";
    
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const sanitized = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
      const isBullet = checkIsBullet(sanitized);
      
      if (isBullet) {
        if (currentLine) combinedLines.push(currentLine);
        currentLine = line;
      } else {
        if (!currentLine) {
          // This is a title/subtitle before any bullets
          combinedLines.push(line);
        } else {
          // We are inside a bullet. Is this line a continuation?
          const prevSanitized = currentLine.trim();
          const endsWithPunctuation = /[.!?]$/.test(prevSanitized);
          
          const firstChar = sanitized.charAt(0);
          const startsWithLowercase = firstChar && firstChar.toLowerCase() === firstChar && firstChar.toUpperCase() !== firstChar;
          
          if (!endsWithPunctuation || startsWithLowercase) {
            // Combine with current bullet
            currentLine += " " + line;
          } else {
            // Not a continuation. Push the finished bullet and start over.
            combinedLines.push(currentLine);
            currentLine = "";
            combinedLines.push(line);
          }
        }
      }
    }
    
    if (currentLine) combinedLines.push(currentLine);
    
    return combinedLines;
  };

  const renderRawBullets = (text: string) => {
    if (!text) return null;
    const lines = preProcessLines(text);
    return lines.map((line, i) => {
      const sanitizedLine = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
      const isBullet = checkIsBullet(sanitizedLine);
      const cleanLine = getCleanLine(sanitizedLine);
      if (isBullet) {
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{cleanLine}</Text>
          </View>
        );
      }
      return <Text key={i} style={styles.textBlock}>{cleanLine}</Text>;
    });
  };

  const renderProjects = (text: string) => {
    if (!text) return null;
    const lines = preProcessLines(text);
    
    return lines.map((line, i) => {
      const sanitizedLine = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
      const isBullet = checkIsBullet(sanitizedLine);
      const cleanLine = getCleanLine(sanitizedLine);
      
      if (isBullet) {
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{cleanLine}</Text>
          </View>
        );
      }
      
      const prevLine = i > 0 ? lines[i - 1] : null;
      const prevIsBullet = prevLine ? checkIsBullet(prevLine.replace(/^[\s\u200B-\u200D\uFEFF]+/, '')) : false;
      
      // If it's all caps (and has at least 4 letters), treat it as a title
      const isAllCaps = cleanLine === cleanLine.toUpperCase() && cleanLine.replace(/[^A-Z]/g, '').length > 3;
      
      if (i === 0 || prevIsBullet || isAllCaps) {
        return (
          <Text key={i} style={{ ...styles.jobTitle, marginTop: i > 0 ? 12 : 0, marginBottom: 2 }}>
            {cleanLine}
          </Text>
        );
      }
      
      return (
        <Text key={i} style={{ ...styles.company, marginBottom: 6 }}>
          {cleanLine}
        </Text>
      );
    });
  };

  const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {name && <Text style={styles.name}>{name}</Text>}
          <View style={styles.contactRow}>
            {email && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><IconEmail /></View>
                <Text>{email}</Text>
              </View>
            )}
            {phone && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><IconPhone /></View>
                <Text>{phone}</Text>
              </View>
            )}
            {location && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><IconMapPin /></View>
                <Text>{location}</Text>
              </View>
            )}
            {linkedin && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><IconLinkedin /></View>
                <Link src={linkedin} style={styles.link}>{cleanUrl(linkedin)}</Link>
              </View>
            )}
            {github && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><IconGithub /></View>
                <Link src={github} style={styles.link}>{cleanUrl(github)}</Link>
              </View>
            )}
          </View>
        </View>

        {/* Summary Section */}
        {summary && summary.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            {renderRawBullets(summary)}
          </View>
        )}

        {/* Experience Section */}
        {(structuredExperience?.length ? structuredExperience.length > 0 : experience) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            
            {structuredExperience && structuredExperience.length > 0 ? (
              structuredExperience.map((exp, i) => (
                <View key={i} style={styles.entryBlock}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.jobTitle}>{exp.job_title}</Text>
                    <Text style={styles.dates}>{exp.dates}</Text>
                  </View>
                  <Text style={styles.company}>{exp.company}</Text>
                  {exp.bullet_points.map((bullet, j) => (
                    <View key={j} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              renderRawBullets(experience)
            )}
          </View>
        )}

        {/* Education Section */}
        {(eduEntries.length > 0 || parsedData?.education) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {eduEntries.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              eduEntries.map((entry: any, i: number) => (
                <View key={i} style={styles.entryBlock}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.degree}>{entry.degree}</Text>
                    {entry.year && <Text style={styles.dates}>{entry.year}</Text>}
                  </View>
                  <Text style={styles.institution}>{entry.institution}</Text>
                </View>
              ))
            ) : (
              renderRawBullets(parsedData.education)
            )}
          </View>
        )}

        {/* Projects Section */}
        {projects && projects.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {renderProjects(projects)}
          </View>
        )}

        {/* Skills Section */}
        {categorized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {categorized.technical?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Technical:</Text>
                <Text style={styles.skillsText}>{categorized.technical.join(', ')}</Text>
              </View>
            )}
            {categorized.tools?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Tools:</Text>
                <Text style={styles.skillsText}>{categorized.tools.join(', ')}</Text>
              </View>
            )}
            {categorized.soft?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Soft Skills:</Text>
                <Text style={styles.skillsText}>{categorized.soft.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Certifications Section */}
        {certifications && certifications.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {renderRawBullets(certifications)}
          </View>
        )}

        {/* Awards Section */}
        {awards && awards.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awards & Honors</Text>
            {renderRawBullets(awards)}
          </View>
        )}

        {/* Languages Section */}
        {languages && languages.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {renderRawBullets(languages)}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDF;
