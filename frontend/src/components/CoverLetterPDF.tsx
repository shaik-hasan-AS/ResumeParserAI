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
const themeStyles = {
  modern: StyleSheet.create({
    page: {
      padding: '40px 48px',
      fontFamily: 'Helvetica',
      backgroundColor: '#FFFFFF',
      color: '#111827',
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
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
    separator: {
      display: 'none',
    },
    link: {
      color: '#4B5563',
      textDecoration: 'none',
    },
    body: {
      fontSize: 11,
      lineHeight: 1.6,
      color: '#374151',
    },
    paragraph: {
      marginBottom: 16,
    }
  }),
  harvard: StyleSheet.create({
    page: {
      padding: '36px 48px',
      fontFamily: 'Times-Roman',
      backgroundColor: '#FFFFFF',
      color: '#000000',
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    name: {
      fontSize: 24,
      fontFamily: 'Times-Bold',
      marginBottom: 4,
      color: '#000000',
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 10,
      color: '#000000',
    },
    contactIcon: {
      display: 'none',
    },
    separator: {
      fontSize: 10,
      color: '#000000',
      marginHorizontal: 4,
    },
    link: {
      color: '#000000',
      textDecoration: 'none',
    },
    body: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#000000',
    },
    paragraph: {
      marginBottom: 14,
    }
  })
};

interface CoverLetterPDFProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedData: any;
  overrides: Record<string, string>;
  coverLetterText: string;
  theme?: 'modern' | 'harvard';
}

const CoverLetterPDF: React.FC<CoverLetterPDFProps> = ({ parsedData, overrides, coverLetterText, theme = 'modern' }) => {
  const styles = themeStyles[theme];
  const getVal = (key: string) => overrides[key] || parsedData?.[key];

  const name = getVal('name');
  const email = getVal('email');
  const phone = getVal('phone');
  const linkedin = getVal('linkedin');
  const github = getVal('github');
  const location = getVal('location');

  const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');

  const contactItems = [];
  if (email) contactItems.push({ type: 'email', val: email, icon: <IconEmail /> });
  if (phone) contactItems.push({ type: 'phone', val: phone, icon: <IconPhone /> });
  if (location) contactItems.push({ type: 'location', val: location, icon: <IconMapPin /> });
  if (linkedin) contactItems.push({ type: 'linkedin', val: linkedin, icon: <IconLinkedin />, link: true });
  if (github) contactItems.push({ type: 'github', val: github, icon: <IconGithub />, link: true });

  // Split cover letter text by newlines into paragraphs
  const paragraphs = coverLetterText.split('\n').filter(p => p.trim().length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {name && <Text style={styles.name}>{name}</Text>}
          {contactItems.length > 0 && (
             <View style={styles.contactRow}>
               {contactItems.map((item, index) => (
                 <React.Fragment key={index}>
                   <View style={styles.contactItem}>
                     {theme === 'modern' && <View style={styles.contactIcon}>{item.icon}</View>}
                     {item.link ? (
                       <Link src={item.val} style={styles.link}>{cleanUrl(item.val)}</Link>
                     ) : (
                       <Text>{item.val}</Text>
                     )}
                   </View>
                   {theme === 'harvard' && index < contactItems.length - 1 && (
                     <Text style={styles.separator}>|</Text>
                   )}
                 </React.Fragment>
               ))}
             </View>
          )}
        </View>

        {/* Body Section */}
        <View style={styles.body}>
          {paragraphs.map((p, index) => (
            <Text key={index} style={styles.paragraph}>
              {p}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default CoverLetterPDF;
