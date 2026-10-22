import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";
import { SproutIcon, FlowerIcon } from "./GardenIcons";
import { TeacherNavLinks, StudentNavLinks, GuestNavLinks } from "./NavLinks";
import { UserAvatar } from "./UserAvatar";
import { LogOut } from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  const profileHref = session?.role === "teacher" ? "/teacher/profile" : "/student/profile";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link
            href={session?.role === "teacher" ? "/teacher" : session ? "/student" : "/"}
            className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-emerald-500 rounded-xl p-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <SproutIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="font-bold text-xl sm:text-2xl text-emerald-800 tracking-tight"
                  style={{ fontFamily: "var(--font-fredoka)" }}
                >
                  Bright English Garden
                </span>
                <FlowerIcon className="w-5 h-5 animate-garden-float hidden sm:inline-block" />
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Primary Classroom English • Grades 1–5
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                {/* Teacher Nav Links */}
                {session.role === "teacher" && <TeacherNavLinks />}

                {/* Student Nav Links */}
                {session.role === "student" && <StudentNavLinks />}

                {/* Profile Pill & Role Badge (Clickable Link to Profile) */}
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  <Link
                    href={profileHref}
                    title="Edit Profile & Account Settings"
                    className="flex items-center gap-2 bg-stone-50 hover:bg-emerald-50 border border-stone-200/80 hover:border-emerald-300 rounded-2xl px-3 py-1.5 transition-all duration-150 group cursor-pointer"
                  >
                    <UserAvatar
                      avatar={session.avatar}
                      name={session.name}
                      size="sm"
                      className="group-hover:scale-105 transition-transform"
                    />
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-stone-800 group-hover:text-emerald-900 leading-tight">
                        {session.name}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                        {session.role === "teacher" ? "Teacher Desk" : `Grade ${session.grade || 1} Student`}
                      </span>
                    </div>
                  </Link>

                  {/* Logout Form */}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      aria-label="Sign out"
                      className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Guest Actions with Active Highlighting */
              <GuestNavLinks />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
