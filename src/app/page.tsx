import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth/session";
import {
  SproutIcon,
  FlowerIcon,
  BeeIcon,
  OwlIcon,
  WateringCanIcon,
} from "@/components/GardenIcons";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Layers,
  ArrowRight,
  Smile,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Whimsical background floating elements */}
          <div className="absolute top-10 left-10 text-emerald-300 opacity-60 animate-garden-float hidden lg:block">
            <SproutIcon className="w-16 h-16" />
          </div>
          <div className="absolute top-20 right-14 text-amber-300 opacity-70 animate-garden-float hidden lg:block" style={{ animationDelay: "1.5s" }}>
            <BeeIcon className="w-14 h-14" />
          </div>
          <div className="absolute bottom-10 left-1/4 text-rose-300 opacity-50 animate-garden-float hidden lg:block" style={{ animationDelay: "2s" }}>
            <FlowerIcon className="w-12 h-12" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Top Friendly Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs mb-6 animate-garden-pulse">
              <FlowerIcon className="w-4 h-4 text-rose-500" />
              <span>Dedicated Primary English Learning Garden (Grades 1–5)</span>
            </div>

            {/* Main Title */}
            <h1
              className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight sm:leading-tight mb-6"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Where Young Minds Blossom in{" "}
              <span className="text-emerald-700 underline decoration-amber-300 decoration-wavy decoration-2">
                English!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-stone-600 font-medium mb-10 leading-relaxed">
              A private, cheerful sanctuary for our classroom. The teacher organizes lesson plans,
              fun worksheets, phonics, and revision cards — while students explore at their own pace!
            </p>

            {/* Entry Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              {session ? (
                <Link
                  href={session.role === "teacher" ? "/teacher" : "/student"}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Go to My Garden</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    <Smile className="w-5 h-5 text-amber-200" />
                    <span>Student Sign Up</span>
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-lg border-2 border-stone-200 shadow-sm transition-all"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Portals Showcase */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Garden Card */}
            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-100 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6">
                <SproutIcon className="w-8 h-8" />
              </div>
              <h2
                className="text-2xl font-bold text-stone-900 mb-3"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Student Learning Library
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Tailored for young learners in Grades 1 to 5. Clean, cheerful, and distraction-free.
                Students can browse phonics, grammar rules, spelling games, and downloadable worksheets published by the teacher.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 font-medium mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</div>
                  <span>Grade-specific filtering (Grades 1 through 5)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</div>
                  <span>Instant PDF worksheet viewing & downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</div>
                  <span>Friendly teacher notes & cheerful instructions</span>
                </li>
              </ul>
              <Link
                href="/login?role=student"
                className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm group-hover:translate-x-1 transition-transform"
              >
                <span>Enter Student Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Teacher Desk Card */}
            <div className="bg-white rounded-3xl p-8 border-2 border-amber-100 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6">
                <OwlIcon className="w-8 h-8" />
              </div>
              <h2
                className="text-2xl font-bold text-stone-900 mb-3"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Teacher Administrative Desk
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                The central control room for the teacher. Securely upload teaching files,
                curate lesson plans, keep private drafts, publish materials, and manage student accounts.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 font-medium mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">✓</div>
                  <span>Private Drafts & Instant One-Click Publishing</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">✓</div>
                  <span>Persistent Remote Cloud Storage outside Vercel</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">✓</div>
                  <span>Student account supervision & status control</span>
                </li>
              </ul>
              <Link
                href="/login?role=teacher"
                className="inline-flex items-center gap-2 text-amber-700 font-bold text-sm group-hover:translate-x-1 transition-transform"
              >
                <span>Access Teacher Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Pillars */}
        <section className="bg-white border-y border-stone-200/80 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3
                className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Cultivating English Excellence
              </h3>
              <p className="text-sm text-stone-600">
                Designed specifically for primary education workflows with safety, simplicity, and joy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-stone-200/70">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-stone-900 mb-1" style={{ fontFamily: "var(--font-fredoka)" }}>
                  Grades 1 to 5
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Tailored progression from alphabet phonics up to Grade 5 reading comprehension and creative essays.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-stone-200/70">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-stone-900 mb-1" style={{ fontFamily: "var(--font-fredoka)" }}>
                  Multi-Format
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Supports printable PDFs, Word documents, PowerPoint slide decks, and illustrated flashcards.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-stone-200/70">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <WateringCanIcon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-stone-900 mb-1" style={{ fontFamily: "var(--font-fredoka)" }}>
                  Safe & Secure
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Strict server-side role boundaries. No student-to-student messaging or public exposure.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-stone-200/70">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-stone-900 mb-1" style={{ fontFamily: "var(--font-fredoka)" }}>
                  Remote Storage
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Persistent cloud storage adapter. Fully decoupled from ephemeral serverless filesystems.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
