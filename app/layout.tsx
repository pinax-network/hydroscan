import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HydroScan - Aquarium of Token Transfers",
  description: "Visualize token transfer activity as an aquarium.",
  openGraph: {
    images: [
      {
        url: "/meta.png",
        width: 1200,
        height: 630,
        alt: "HydroScan",
      },
    ],
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
