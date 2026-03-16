import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sky.buzz"),
  title: {
    default: "Sky.buzz | Digital studio",
    template: "%s | Sky.buzz",
  },
  description:
    "Sky is a digital studio: strategy, design, and web development focused on clarity, reliable behavior, and measurable outcomes.",
  applicationName: "Sky.buzz",
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
    locale: "en_US",
    url: "https://sky.buzz",
    siteName: "Sky.buzz",
    title: "Sky.buzz | Digital studio",
    description:
      "Design and web development for clear communication, stable behavior, and easy use.",
    images: [
      {
        url: "/skybuzz_logo_final (1).png",
        width: 1200,
        height: 630,
        alt: "Sky.buzz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sky.buzz | Digital studio",
    description:
      "Strategy, design, and web development for brands that need a clear digital presence.",
    images: ["/skybuzz_logo_final (1).png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-light">{children}</body>
    </html>
  );
}
