import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sky.ro"),
  title: {
    default: "SKY.RO | Website-uri premium și sisteme de marketing care convertesc",
    template: "%s | SKY.RO",
  },
  description:
    "SKY.RO construiește website-uri premium și sisteme digitale bine gândite pentru claritate, încredere și conversie. 70+ proiecte livrate în România.",
  applicationName: "SKY.RO",
  keywords: [
    "creare site web profesional",
    "website premium Romania",
    "agentie web Romania",
    "landing page conversie",
    "magazin online",
    "strategie digitala",
    "design web premium",
    "site care genereaza cereri",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://sky.ro",
    siteName: "SKY.RO",
    title: "SKY.RO | Website-uri și sisteme de marketing care transformă traficul în cereri",
    description:
      "Construim website-uri premium, landing page-uri de conversie și sisteme de marketing. Design care arată bine și funcționează cum trebuie. 70+ proiecte livrate.",
    images: [
      {
        url: "/sky/logo.png",
        width: 1200,
        height: 630,
        alt: "SKY.RO — Website-uri premium și sisteme de marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKY.RO | Website-uri și sisteme de marketing care transformă traficul în cereri",
    description:
      "Website-uri premium, landing page-uri de conversie și sisteme de marketing bine gândite. 70+ proiecte livrate în România.",
    images: ["/sky/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="antialiased font-light">{children}</body>
    </html>
  );
}
