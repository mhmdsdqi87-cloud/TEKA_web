import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TEKA, SOCIALS } from "@/lib/teka/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://teka-web-beta.vercel.app";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TEKA.name} — ${TEKA.tagline}`,
    template: `%s — ${TEKA.name}`,
  },
  description: TEKA.brandStatement,
  keywords: [
    "TEKA",
    "TEKA ecosystem",
    "TEKA token",
    "تکا",
    "technology ecosystem",
    "digital innovation",
    "digital products",
    "next-generation technology",
    "web3",
    "blockchain infrastructure",
    "ERC-20",
    "crypto ecosystem",
    "futuristic website",
    "sci-fi platform",
  ],
  authors: [{ name: "Mohammad Sadeghi", url: SOCIALS.github }],
  creator: "TEKA",
  publisher: "TEKA",
  applicationName: TEKA.name,
  category: "technology",
  classification: "Technology Platform",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/icon-512.png" }],
  },
  openGraph: {
    title: `${TEKA.name} — ${TEKA.tagline}`,
    description: TEKA.brandStatement,
    siteName: TEKA.name,
    url: "/",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "TEKA — Building The Future Of Digital Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TEKA.name} — ${TEKA.tagline}`,
    description: TEKA.brandStatement,
    creator: "@TEKAweb3",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Structured data — Organization + WebSite (schema.org). */
function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: TEKA.name,
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        description: TEKA.description,
        email: SOCIALS.email,
        founder: {
          "@type": "Person",
          name: "Mohammad Sadeghi",
          url: SOCIALS.github,
        },
        foundingDate: String(TEKA.foundedYear),
        sameAs: [SOCIALS.telegram, SOCIALS.x, SOCIALS.github],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: TEKA.name,
        description: TEKA.brandStatement,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} antialiased bg-background text-foreground font-sans min-h-screen flex flex-col`}
      >
        {/* Cosmic nebula layers — fixed atmosphere behind the whole platform */}
        <div className="nebula nebula-page nebula-a" aria-hidden="true" />
        <div className="nebula nebula-page nebula-b" aria-hidden="true" />
        {children}
        <JsonLd />
        <Toaster />
      </body>
    </html>
  );
}
