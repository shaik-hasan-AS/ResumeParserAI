const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/ResumePDF.tsx', 'utf8');

// The DEFAULT_SECTION_ORDER from store needs to be imported or hardcoded.
// Since we don't export it in ResumePDF yet, let's just hardcode it for safety or import it.
content = content.replace(
  `import { Document, Page, Text, View, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';`,
  `import { Document, Page, Text, View, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';\nimport { DEFAULT_SECTION_ORDER } from '../store/useResumeStore';`
);

const oldSections = `
        {/* Experience Section */}
        {isVisible('experience') && (structuredExperience?.length ? structuredExperience.length > 0 : experience) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.experience || 'Experience'}</Text>
            
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
        {isVisible('education') && (eduEntries.length > 0 || parsedData?.education) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.education || 'Education'}</Text>
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
        {isVisible('projects') && projects && projects.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.projects || 'Projects'}</Text>
            {renderProjects(projects)}
          </View>
        )}

        {/* Skills Section */}
        {isVisible('skills') && categorized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.skills || 'Skills'}</Text>
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
        {isVisible('certifications') && certifications && certifications.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.certifications || 'Certifications'}</Text>
            {renderRawBullets(certifications)}
          </View>
        )}

        {/* Awards Section */}
        {isVisible('awards') && awards && awards.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.awards || 'Awards & Honors'}</Text>
            {renderRawBullets(awards)}
          </View>
        )}

        {/* Languages Section */}
        {isVisible('languages') && languages && languages.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.languages || 'Languages'}</Text>
            {renderRawBullets(languages)}
          </View>
        )}

        {/* Custom Sections */}
        {parsedData?.custom_sections && parsedData.custom_sections.map((sec: any, index: number) => {
          const visibilityKey = sec.id ? \`custom_\${sec.id}\` : \`custom_\${index}\`;
          if (!isVisible(visibilityKey) || !sec.title || !sec.content.trim()) return null;
          return (
            <View key={visibilityKey} style={styles.section}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              {renderRawBullets(sec.content)}
            </View>
          );
        })}
`.trim();

const newSections = `
        {/* Render Sections Dynamically Based on Order */}
        {(parsedData?.section_order || DEFAULT_SECTION_ORDER).map((sectionName) => {
          if (sectionName === 'experience' && isVisible('experience') && (structuredExperience?.length ? structuredExperience.length > 0 : experience)) {
            return (
              <View key="experience" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.experience || 'Experience'}</Text>
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
            );
          }

          if (sectionName === 'education' && isVisible('education') && (eduEntries.length > 0 || parsedData?.education)) {
            return (
              <View key="education" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.education || 'Education'}</Text>
                {eduEntries.length > 0 ? (
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
            );
          }

          if (sectionName === 'projects' && isVisible('projects') && projects && projects.trim().length > 0) {
            return (
              <View key="projects" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.projects || 'Projects'}</Text>
                {renderProjects(projects)}
              </View>
            );
          }

          if (sectionName === 'skills' && isVisible('skills') && categorized) {
            return (
              <View key="skills" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.skills || 'Skills'}</Text>
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
            );
          }

          if (sectionName === 'certifications' && isVisible('certifications') && certifications && certifications.trim().length > 0) {
            return (
              <View key="certifications" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.certifications || 'Certifications'}</Text>
                {renderRawBullets(certifications)}
              </View>
            );
          }

          if (sectionName === 'awards' && isVisible('awards') && awards && awards.trim().length > 0) {
            return (
              <View key="awards" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.awards || 'Awards & Honors'}</Text>
                {renderRawBullets(awards)}
              </View>
            );
          }

          if (sectionName === 'languages' && isVisible('languages') && languages && languages.trim().length > 0) {
            return (
              <View key="languages" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.languages || 'Languages'}</Text>
                {renderRawBullets(languages)}
              </View>
            );
          }

          if (sectionName === 'custom_sections' && parsedData?.custom_sections) {
            return parsedData.custom_sections.map((sec: any, index: number) => {
              const visibilityKey = sec.id ? \`custom_\${sec.id}\` : \`custom_\${index}\`;
              if (!isVisible(visibilityKey) || !sec.title || !sec.content.trim()) return null;
              return (
                <View key={visibilityKey} style={styles.section}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  {renderRawBullets(sec.content)}
                </View>
              );
            });
          }

          return null;
        })}
`.trim();

// Add summary to the loop since summary is also in DEFAULT_SECTION_ORDER
const summaryOld = `
        {/* Summary Section */}
        {isVisible('summary') && summary && summary.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.summary || 'Professional Summary'}</Text>
            {renderRawBullets(summary)}
          </View>
        )}
`.trim();

const summaryNew = `
          if (sectionName === 'summary' && isVisible('summary') && summary && summary.trim().length > 0) {
            return (
              <View key="summary" style={styles.section}>
                <Text style={styles.sectionTitle}>{labels.summary || 'Professional Summary'}</Text>
                {renderRawBullets(summary)}
              </View>
            );
          }
`.trim();

content = content.replace(summaryOld + '\n\n' + oldSections, newSections.replace('{(parsedData?.section_order || DEFAULT_SECTION_ORDER).map((sectionName) => {', '{(parsedData?.section_order || DEFAULT_SECTION_ORDER).map((sectionName) => {\n' + summaryNew));

fs.writeFileSync('frontend/src/components/ResumePDF.tsx', content);
