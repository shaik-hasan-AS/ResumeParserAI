/**
 * Client-side DOCX generator using the 'docx' npm package.
 * Generates highly formatted, ATS-compliant resumes with real Microsoft Word styling.
 * 
 * ponytail: generates native XML structures, no HTML-to-doc wrappers.
 *          Ceiling: Styles are defined in code.
 *          Upgrade path: Add templates or JSON styles.
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Packer
} from 'docx';

export interface ExperienceEntry {
  job_title: string;
  company: string;
  dates: string;
  bullet_points: string[];
}

export interface ResumeDocxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  overrides: Record<string, string>;
  aiRewrites?: Array<{ original: string; improved: string }>;
  structuredExperience?: ExperienceEntry[];
  theme?: 'modern' | 'harvard' | 'executive';
  aiSummary?: string;
  customAccentColor?: string;
  customFontSize?: 'small' | 'medium' | 'large';
  customSpacing?: 'compact' | 'normal' | 'spacious';
  customFontFamily?: string;
}

export async function generateResumeDocx(props: ResumeDocxProps): Promise<Blob> {
  const {
    parsedData,
    overrides,
    aiRewrites,
    structuredExperience,
    theme = 'modern',
    aiSummary,
    customAccentColor,
    customFontSize = 'medium',
    customSpacing = 'normal',
    customFontFamily
  } = props;

  const getVal = (key: string) => overrides?.[key] || parsedData?.[key];

  const name = getVal('name') || '';
  const email = getVal('email') || '';
  const phone = getVal('phone') || '';
  const linkedin = getVal('linkedin') || '';
  const github = getVal('github') || '';
  const location = getVal('location') || '';

  const summary = aiSummary || getVal('summary') || '';
  const projects = getVal('projects') || '';
  const categorized = parsedData?.skills_categorized;
  const eduEntries = parsedData?.education_entries || [];
  
  let experience = parsedData?.experience || '';
  if (experience && aiRewrites && aiRewrites.length > 0) {
    aiRewrites.forEach((rewrite) => {
      if (rewrite.original && rewrite.improved) {
        experience = experience.replace(rewrite.original, rewrite.improved);
      }
    });
  }

  // Spacing helper (twips: 20 twips = 1 pt)
  const getSpacing = () => {
    switch (customSpacing) {
      case 'compact':
        return { before: 80, after: 80, line: 240 };
      case 'spacious':
        return { before: 160, after: 160, line: 320 };
      case 'normal':
      default:
        return { before: 120, after: 120, line: 280 };
    }
  };

  // Font size helper (half-points: 24 = 12pt)
  const getFontSize = (type: 'name' | 'heading' | 'body') => {
    const scale = customFontSize === 'small' ? -2 : customFontSize === 'large' ? 2 : 0;
    if (type === 'name') return (24 + scale * 2);
    if (type === 'heading') return (13 + scale);
    return (10 + scale) * 2; // body sizes are standard half-points (20 = 10pt)
  };

  // Fonts & Colors by Theme
  const getThemeConfig = () => {
    const font = customFontFamily || (theme === 'harvard' ? 'Times New Roman' : 'Arial');
    const accent = customAccentColor || (theme === 'executive' ? '1E3A5F' : '000000');
    return {
      font,
      accent: accent.replace('#', ''),
      align: theme === 'executive' ? AlignmentType.LEFT : AlignmentType.CENTER
    };
  };

  const config = getThemeConfig();
  const spacing = getSpacing();
  const bodySize = getFontSize('body');
  const headingSize = getFontSize('heading');

  const children: any[] = [];

  // 1. Header (Name + Contact details)
  if (name) {
    children.push(
      new Paragraph({
        alignment: config.align,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: name,
            bold: true,
            size: getFontSize('name'),
            font: config.font,
            color: config.accent
          })
        ]
      })
    );
  }

  const contacts: string[] = [];
  if (email) contacts.push(email);
  if (phone) contacts.push(phone);
  if (location) contacts.push(location);
  if (linkedin) contacts.push(linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (github) contacts.push(github.replace(/^https?:\/\/(www\.)?/, ''));

  if (contacts.length > 0) {
    children.push(
      new Paragraph({
        alignment: config.align,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: contacts.join('   |   '),
            size: bodySize - 2,
            font: config.font,
            color: '555555'
          })
        ]
      })
    );
  }

  // Section Heading Helper
  const addSectionHeading = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: {
          bottom: {
            color: config.accent,
            space: 4,
            style: BorderStyle.SINGLE,
            size: 12
          }
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: headingSize * 2,
            font: config.font,
            color: config.accent
          })
        ]
      })
    );
  };

  // Line/Bullet preprocessing (replicating clean formatting from UI)
  const checkIsBullet = (text: string) => /^[•\-\*\,➢▪●○❖·‚¸\–\—\~>+，]/.test(text.trim());
  const getCleanLine = (text: string) => {
    const clean = text.trim();
    if (checkIsBullet(clean)) {
      return clean.substring(1).trim();
    }
    return clean;
  };

  const processLines = (text: string): string[] => {
    if (!text) return [];
    return text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
  };

  // 2. Summary
  if (summary.trim()) {
    addSectionHeading(parsedData?.section_labels?.summary || 'Professional Summary');
    const summaryLines = processLines(summary);
    summaryLines.forEach(line => {
      children.push(
        new Paragraph({
          spacing,
          children: [
            new TextRun({
              text: getCleanLine(line),
              font: config.font,
              size: bodySize
            })
          ]
        })
      );
    });
  }

  // 3. Experience
  const hasExp = structuredExperience?.length ? structuredExperience.length > 0 : experience;
  if (hasExp) {
    addSectionHeading(parsedData?.section_labels?.experience || 'Experience');
    
    if (structuredExperience && structuredExperience.length > 0) {
      structuredExperience.forEach(exp => {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: exp.job_title,
                bold: true,
                font: config.font,
                size: bodySize
              }),
              new TextRun({
                text: `   —   ${exp.company}`,
                italics: true,
                font: config.font,
                size: bodySize
              }),
              new TextRun({
                text: ` (${exp.dates})`,
                font: config.font,
                size: bodySize - 2,
                color: '666666'
              })
            ]
          })
        );

        exp.bullet_points.forEach(bullet => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 40, after: 40, line: spacing.line },
              children: [
                new TextRun({
                  text: getCleanLine(bullet),
                  font: config.font,
                  size: bodySize
                })
              ]
            })
          );
        });
      });
    } else {
      // Raw fallback
      const expLines = processLines(experience);
      expLines.forEach(line => {
        const isBullet = checkIsBullet(line);
        children.push(
          new Paragraph({
            bullet: isBullet ? { level: 0 } : undefined,
            spacing: { before: 40, after: 40, line: spacing.line },
            children: [
              new TextRun({
                text: getCleanLine(line),
                font: config.font,
                size: bodySize
              })
            ]
          })
        );
      });
    }
  }

  // 4. Skills
  if (categorized) {
    addSectionHeading(parsedData?.section_labels?.skills || 'Skills');

    const addSkillRow = (label: string, items: string[]) => {
      if (!items || items.length === 0) return;
      children.push(
        new Paragraph({
          spacing,
          children: [
            new TextRun({
              text: `${label}: `,
              bold: true,
              font: config.font,
              size: bodySize
            }),
            new TextRun({
              text: items.join(', '),
              font: config.font,
              size: bodySize
            })
          ]
        })
      );
    };

    addSkillRow('Technical Skills', categorized.technical);
    addSkillRow('Tools & Technologies', categorized.tools);
    addSkillRow('Soft Skills', categorized.soft);
  }

  // 5. Education
  if (eduEntries.length > 0 || parsedData?.education) {
    addSectionHeading(parsedData?.section_labels?.education || 'Education');
    if (eduEntries.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eduEntries.forEach((edu: any) => {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                font: config.font,
                size: bodySize
              }),
              new TextRun({
                text: `   —   ${edu.institution}`,
                font: config.font,
                size: bodySize
              }),
              edu.year ? new TextRun({
                text: ` (${edu.year})`,
                font: config.font,
                size: bodySize,
                color: '555555'
              }) : new TextRun('')
            ]
          })
        );
      });
    } else {
      // Raw fallback
      const eduLines = processLines(parsedData.education);
      eduLines.forEach(line => {
        children.push(
          new Paragraph({
            spacing,
            children: [
              new TextRun({
                text: getCleanLine(line),
                font: config.font,
                size: bodySize
              })
            ]
          })
        );
      });
    }
  }

  // 6. Projects
  if (projects.trim()) {
    addSectionHeading(parsedData?.section_labels?.projects || 'Projects');
    const projectLines = processLines(projects);
    projectLines.forEach(line => {
      const isBullet = checkIsBullet(line);
      children.push(
        new Paragraph({
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { before: 40, after: 40, line: spacing.line },
          children: [
            new TextRun({
              text: getCleanLine(line),
              font: config.font,
              size: bodySize,
              bold: !isBullet && (line === line.toUpperCase())
            })
          ]
        })
      );
    });
  }

  // 7. Custom Sections
  const customSections = parsedData?.custom_sections || [];
  customSections.forEach((sec: any) => {
    if (!sec.content || !sec.content.trim()) return;
    addSectionHeading(sec.title || 'Section');
    const secLines = processLines(sec.content);
    secLines.forEach(line => {
      const isBullet = checkIsBullet(line);
      children.push(
        new Paragraph({
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { before: 40, after: 40, line: spacing.line },
          children: [
            new TextRun({
              text: getCleanLine(line),
              font: config.font,
              size: bodySize
            })
          ]
        })
      );
    });
  });

  // Construct standard Word document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children
      }
    ]
  });

  return Packer.toBlob(doc);
}
