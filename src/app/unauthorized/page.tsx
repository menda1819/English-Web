import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldAlert, ArrowLeft, BookOpen } from "lucide-react";
import { FlowerIcon } from "@/components/GardenIcons";

export const metadata = {
  title: "Access Restricted",
  description: "Teacher-only classroom area.",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            Garden Gate Locked 🌸
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed">
            This area is reserved exclusively for Teacher Florence to manage classroom curriculum and private lesson plans.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/student"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Return to Student Library</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
