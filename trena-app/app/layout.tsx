import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://trena.ai'),
  title: "Trena.ai - Sales Enablement Platform",
  description: "AI-powered sales enablement platform for personalized outreach and lead prioritization",
  icons: {
    icon: '/favicon.ico',
    apple: '/images/social media/favicon-retina.png',
  },
  openGraph: {
    title: "Trena.ai - Sales Enablement Platform",
    description: "AI-powered sales enablement platform for personalized outreach and lead prioritization",
    url: 'https://trena.ai',
    siteName: 'Trena.ai',
    images: [
      {
        url: '/images/Trena_logo-color.png',
        width: 1200,
        height: 630,
        alt: 'Trena.ai Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Trena.ai - Sales Enablement Platform",
    description: "AI-powered sales enablement platform for personalized outreach and lead prioritization",
    images: ['/images/Trena_logo-color.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
