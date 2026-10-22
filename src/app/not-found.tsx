import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SproutIcon } from "@/components/GardenIcons";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
            <SproutIcon className="w-10 h-10" />
          </div>

          <h1
            className="text-3xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            Garden Path Not Found! 🌿
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed">
            Oops! It seems this path got overgrown with weeds. Let&apos;s guide you back to the classroom garden!
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
