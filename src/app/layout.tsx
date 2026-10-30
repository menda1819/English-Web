import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Bright English Garden",
    default: "Bright English Garden - Primary School English Learning Library",
  },
  description:
    "A cheerful classroom garden where primary-school students in Grades 1–5 blossom in their English reading, phonics, grammar, and writing skills.",
  keywords: [
    "English Learning",
    "Primary School",
    "Grades 1-5",
    "Phonics",
    "Worksheets",
    "Lesson Plans",
    "Teacher Resources",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F3] text-stone-800">
        {children}
      </body>
    </html>
  );
}
