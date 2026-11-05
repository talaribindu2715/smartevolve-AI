// Learn more https://docs.expo.dev/router/reference/static-rendering/#root-html

import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ backgroundColor: "#070B14" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Favicons and Brand Metadata */}
        <title>SmartEvolve AI — Autonomous Academic Credentialing & AI-Powered Learning</title>
        <meta name="description" content="SmartEvolve AI: Autonomous academic credentialing, Google Gemini AI skill diagnostics, Polygon EVM blockchain verification, and personalized career roadmaps for engineering scholars." />
        <meta name="keywords" content="SmartEvolve, AI Skill Analysis, Google Gemini 1.5, Polygon Blockchain, EVM Smart Contracts, Autonomous Credentialing, Full Stack Developer, Machine Learning, Interactive Masterclasses, Academic Verification" />
        <meta name="author" content="SmartEvolve Academy" />

        {/* Open Graph / Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SmartEvolve AI" />
        <meta property="og:title" content="SmartEvolve AI — Autonomous Academic Credentialing & AI-Powered Learning" />
        <meta property="og:description" content="Validate real-world skills with Google Gemini AI diagnostics and earn tamper-proof cryptographic credentials anchored on Polygon EVM blockchain." />
        <meta property="og:image" content="/favicon.png" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SmartEvolve AI — Autonomous Academic Credentialing" />
        <meta name="twitter:description" content="Google Gemini AI skill diagnostics & Polygon blockchain cryptographic verification." />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "SmartEvolve AI Academy",
              "description": "Autonomous AI-powered engineering curriculum, Google Gemini skill diagnostics, and Polygon EVM cryptographic credentialing.",
              "url": "https://smart-evolve.vercel.app",
              "hasCredential": {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "Certificate of Completion",
                "recognizedBy": {
                  "@type": "Organization",
                  "name": "SmartEvolve Academy"
                }
              }
            }),
          }}
        />

        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#070B14" />
      </head>
      <body style={{ backgroundColor: "#070B14", margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
