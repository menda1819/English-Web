import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

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
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F3] text-stone-800">
        {children}
      </body>
    </html>
  );
}
