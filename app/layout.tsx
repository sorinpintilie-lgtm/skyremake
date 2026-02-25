import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sky.ro"),
  title: {
    default: "Sky.ro | Atelier digital",
    template: "%s | Sky.ro",
  },
  description:
    "Sky este un atelier digital: strategie, proiectare și dezvoltare web pentru claritate, funcționare bună și rezultate măsurabile.",
  applicationName: "Sky.ro",
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
    siteName: "Sky.ro",
    title: "Sky.ro | Atelier digital",
    description:
      "Proiectare și dezvoltare web pentru o prezentare clară, stabilă și ușor de folosit.",
    images: [
      {
        url: "/sky/logo.png",
        width: 1200,
        height: 630,
        alt: "Sky.ro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sky.ro | Atelier digital",
    description:
      "Strategie, proiectare și dezvoltare web pentru branduri care vor o prezență digitală clară.",
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
