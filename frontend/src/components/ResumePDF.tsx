import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Font } from '@react-pdf/renderer';

// Register Roboto Font
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 700 }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#7C3AED', // Vibrant Purple
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#4C1D95', // Deep purple
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 10,
    color: '#4B5563',
  },
  contactItem: {
    marginRight: 10,
  },
  link: {
    color: '#14b8a6', // Teal
    textDecoration: 'none',
    fontFamily: 'Roboto',
    fontWeight: 700,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#7C3AED', // Vibrant Purple
    textTransform: 'uppercase',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#EDE9FE', // Light purple underline
    paddingBottom: 4,
    letterSpacing: 1,
  },
  text: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  summaryText: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  skillsGroup: {
    marginBottom: 8,
  },
  skillsLabel: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 2,
  },
  educationEntry: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 11,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#4C1D95', // Deep purple
  },
  institution: {
    fontSize: 10,
    color: '#4B5563',
  },
  year: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  jobTitle: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#4C1D95', // Deep purple
  },
  companyWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  company: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#4B5563',
  },
  dates: {
    fontSize: 10,
    color: '#6B7280',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#374151',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  metricText: {
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#7C3AED',
  },
});

interface ExperienceEntry {
  job_title: string;
  company: string;
  dates: string;
  bullet_points: string[];
}

interface ResumePDFProps {
  parsedData: any;
  overrides: Record<string, string>;
  aiRewrites?: Array<{ original: string; improved: string }>;
  structuredExperience?: ExperienceEntry[];
  executiveSummary?: string;
  highlightSkills?: string[];
  targetRole?: string;
}

// Temporarily disabled formatBullet as it may be causing silent crashes in react-pdf
const formatBullet = (text: any) => {
  return text;
};

const ResumePDF: React.FC<ResumePDFProps> = ({ parsedData, overrides, aiRewrites, structuredExperience, executiveSummary, highlightSkills, targetRole }) => {
  const getVal = (key: string) => overrides[key] || parsedData?.[key];

  const name = getVal('name');
  const email = getVal('email');
  const phone = getVal('phone');
  const linkedin = getVal('linkedin');
  const github = getVal('github');
  const location = getVal('location');

  const categorized = parsedData?.skills_categorized;
  const eduEntries = parsedData?.education_entries || [];
  
  // Apply AI rewrites to experience text if available
  let experience = parsedData?.experience;
  if (experience && aiRewrites && aiRewrites.length > 0) {
    aiRewrites.forEach(rewrite => {
      if (rewrite.original && rewrite.improved) {
        // Use a simple replace. We might want to be careful with exact string matching
        // but this handles the direct 1:1 replacements Gemini provides.
        experience = experience.replace(rewrite.original, rewrite.improved);
      }
    });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {name && <Text style={styles.name}>{name}</Text>}
          {targetRole && <Text style={styles.subtitle}>{targetRole}</Text>}
          <View style={styles.contactInfo}>
            {email && <Text style={styles.contactItem}>{email}</Text>}
            {phone && <Text style={styles.contactItem}>•  {phone}</Text>}
            {location && <Text style={styles.contactItem}>•  {location}</Text>}
          </View>
          <View style={[styles.contactInfo, { marginTop: 4 }]}>
            {linkedin && (
              <Link src={linkedin} style={[styles.contactItem, styles.link]}>
                {linkedin.replace(/^https?:\/\//, '')}
              </Link>
            )}
            {github && (
              <Link src={github} style={[styles.contactItem, styles.link]}>
                •  {github.replace(/^https?:\/\//, '')}
              </Link>
            )}
          </View>
        </View>

        {/* Executive Summary Section */}
        {executiveSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{executiveSummary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {(experience || (structuredExperience && structuredExperience.length > 0)) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            
            {structuredExperience && structuredExperience.length > 0 ? (
              structuredExperience.map((exp, i) => {
                // Fallback if AI hallucinates an empty object
                if (!exp.job_title && !exp.company && (!exp.bullet_points || exp.bullet_points.length === 0)) {
                  if (i === 0) return <Text key={i} style={styles.text}>{experience}</Text>;
                  return null;
                }
                
                return (
                  <View key={i} style={{ marginBottom: 12 }}>
                    {exp.job_title && <Text style={styles.jobTitle}>{exp.job_title}</Text>}
                    <View style={styles.companyWrapper}>
                      {exp.company && <Text style={styles.company}>{exp.company}</Text>}
                      {exp.dates && <Text style={styles.dates}>{exp.dates}</Text>}
                    </View>
                    {Array.isArray(exp.bullet_points) && exp.bullet_points.map((bullet, j) => {
                      if (!bullet) return null;
                      return (
                        <View key={j} style={styles.bulletPoint}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })
            ) : (
              <Text style={styles.text}>{experience}</Text>
            )}
          </View>
        ) : null}

        {/* Education Section */}
        {(eduEntries.length > 0 || parsedData?.education) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {eduEntries.length > 0 ? (
              eduEntries.map((entry: any, i: number) => (
                <View key={i} style={styles.educationEntry}>
                  <Text style={styles.degree}>{entry.degree}</Text>
                  <Text style={styles.institution}>{entry.institution}</Text>
                  {entry.year && <Text style={styles.year}>{entry.year}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.text}>{parsedData.education}</Text>
            )}
          </View>
        )}

        {/* Skills Section */}
        {categorized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {categorized.technical?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Technical</Text>
                <Text style={styles.text}>
                  {categorized.technical.map((skill: string, idx: number) => {
                    const isHighlight = highlightSkills?.some(hs => hs.toLowerCase() === skill.toLowerCase());
                    return (
                      <Text key={idx} style={isHighlight ? { fontFamily: 'Roboto', fontWeight: 700, color: '#4C1D95' } : {}}>
                        {skill}{idx < categorized.technical.length - 1 ? ', ' : ''}
                      </Text>
                    );
                  })}
                </Text>
              </View>
            )}
            {categorized.tools?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Tools</Text>
                <Text style={styles.text}>
                  {categorized.tools.map((skill: string, idx: number) => {
                    const isHighlight = highlightSkills?.some(hs => hs.toLowerCase() === skill.toLowerCase());
                    return (
                      <Text key={idx} style={isHighlight ? { fontFamily: 'Roboto', fontWeight: 700, color: '#4C1D95' } : {}}>
                        {skill}{idx < categorized.tools.length - 1 ? ', ' : ''}
                      </Text>
                    );
                  })}
                </Text>
              </View>
            )}
            {categorized.soft?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Soft Skills</Text>
                <Text style={styles.text}>
                  {categorized.soft.map((skill: string, idx: number) => {
                    const isHighlight = highlightSkills?.some(hs => hs.toLowerCase() === skill.toLowerCase());
                    return (
                      <Text key={idx} style={isHighlight ? { fontFamily: 'Roboto', fontWeight: 700, color: '#4C1D95' } : {}}>
                        {skill}{idx < categorized.soft.length - 1 ? ', ' : ''}
                      </Text>
                    );
                  })}
                </Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDF;
