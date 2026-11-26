import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute URLs for the preview images. Vercel inferred them; a self-hosted
  // server would otherwise use http://localhost:3000.
  metadataBase: new URL("https://hydroscan.pinax.network"),
  title: "HydroScan - Aquarium of Token Transfers",
  description: "Visualize token transfer activity as an aquarium.",
  openGraph: {
    title: "HydroScan - Aquarium of Token Transfers",
    description: "Visualize token transfer activity as an aquarium.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "HydroScan aquarium preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HydroScan - Aquarium of Token Transfers",
    description: "Visualize token transfer activity as an aquarium.",
    images: ["/og-preview.png"],
  },
  icons: {
    icon: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
