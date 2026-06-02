import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleOAuthWrapper from "@/components/GoogleOAuthWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://myaiprofile.ai'),
  title: {
    default: "MyAIProfile - ATS-Optimized AI Resume Builder",
    template: "%s | MyAIProfile"
  },
  description: "Instantly optimize your resume for any ATS. Get hired faster with AI-powered keyword analysis, actionable feedback, and dynamic bullet rewrites.",
  keywords: ["resume builder", "ATS optimization", "AI resume parser", "job search", "career", "resume feedback", "ATS score"],
  authors: [{ name: "MyAIProfile Team" }],
  creator: "MyAIProfile",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://myaiprofile.ai",
    title: "MyAIProfile - ATS-Optimized AI Resume Builder",
    description: "Instantly optimize your resume for any ATS. Get hired faster with AI-powered keyword analysis, actionable feedback, and dynamic bullet rewrites.",
    siteName: "MyAIProfile",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyAIProfile - ATS-Optimized AI Resume Builder",
    description: "Instantly optimize your resume for any ATS. Get hired faster with AI-powered keyword analysis, actionable feedback, and dynamic bullet rewrites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GoogleOAuthWrapper>
            {children}
          </GoogleOAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
