import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina F | Enterprise Financial Intelligence",
  description: "World-class financial analysis platform with CFA-level metrics, AI insights, and real-time collaboration",
  keywords: ["financial analysis", "DCF valuation", "financial modeling", "enterprise finance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        {/* Metropolitan Cityscape Background */}
        <div className="cityscape-bg" aria-hidden="true" />
        <div className="city-lights" aria-hidden="true" />

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Subtle noise overlay for texture */}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
