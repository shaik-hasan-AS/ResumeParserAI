import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#7C3AED', // Vibrant Purple
    marginBottom: 8,
    letterSpacing: 1,
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
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
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
  skillsGroup: {
    marginBottom: 8,
  },
  skillsLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  educationEntry: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
    color: '#4C1D95', // Deep purple
  },
  companyWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  company: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
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
}

const ResumePDF: React.FC<ResumePDFProps> = ({ parsedData, overrides, aiRewrites, structuredExperience }) => {
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

        {/* Experience Section */}
        {(structuredExperience?.length ? structuredExperience.length > 0 : experience) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            
            {structuredExperience && structuredExperience.length > 0 ? (
              structuredExperience.map((exp, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text style={styles.jobTitle}>{exp.job_title}</Text>
                  <View style={styles.companyWrapper}>
                    <Text style={styles.company}>{exp.company}</Text>
                    <Text style={styles.dates}>{exp.dates}</Text>
                  </View>
                  {exp.bullet_points.map((bullet, j) => (
                    <View key={j} style={styles.bulletPoint}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.text}>{experience}</Text>
            )}
          </View>
        )}

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
                <Text style={styles.text}>{categorized.technical.join(', ')}</Text>
              </View>
            )}
            {categorized.tools?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Tools</Text>
                <Text style={styles.text}>{categorized.tools.join(', ')}</Text>
              </View>
            )}
            {categorized.soft?.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Soft Skills</Text>
                <Text style={styles.text}>{categorized.soft.join(', ')}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDF;
