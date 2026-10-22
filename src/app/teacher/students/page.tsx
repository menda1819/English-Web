import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireTeacher } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { StudentRow } from "@/components/StudentRow";
import { Users, UserCheck, UserX, ArrowLeft, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student Roster Management",
  description: "View and manage enrolled student accounts across Grades 1–5.",
};

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireTeacher();
  const params = await searchParams;

  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const gradeFilter = typeof params.grade === "string" && params.grade ? parseInt(params.grade, 10) : null;

  await connectToDatabase();

  // Metrics
  const [totalStudents, activeCount, pausedCount] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "student", status: "active" }),
    User.countDocuments({ role: "student", status: "inactive" }),
  ]);

  // Query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { role: "student" };

  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (gradeFilter && !isNaN(gradeFilter)) {
    query.grade = gradeFilter;
  }

  const students = await User.find(query).sort({ grade: 1, name: 1 }).lean();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/teacher"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-stone-900"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Classroom Student Roster 🎒
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Supervise student accounts, review enrolled grades, and manage account access.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Enrolled
              </p>
              <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {totalStudents}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Active Garden Passes
              </p>
              <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {activeCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Paused Accounts
              </p>
              <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {pausedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by student name or username..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </form>

          {/* Grade filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <span className="font-bold text-stone-500 mr-1">Grade:</span>
            <Link
              href="/teacher/students"
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                !gradeFilter
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All
            </Link>
            {[1, 2, 3, 4, 5].map((g) => (
              <Link
                key={g}
                href={`/teacher/students?grade=${g}`}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  gradeFilter === g
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Grade {g}
              </Link>
            ))}
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Users className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="font-bold text-stone-700">No students found matching your search</p>
              <p className="text-xs text-stone-400 mt-1">
                Students can create their free learning pass on the registration page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50/70 text-stone-500 text-[11px] font-bold uppercase tracking-wider text-left">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Enrolled Grade
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Grade Access
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Account Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {students.map((st) => (
                    <StudentRow
                      key={st._id.toString()}
                      student={{
                        id: st._id.toString(),
                        name: st.name,
                        email: st.email,
                        grade: st.grade || 1,
                        avatar: st.avatar,
                        status: st.status,
                        accessAllGrades: Boolean(st.accessAllGrades),
                        allowedGrades: st.allowedGrades || [],
                        createdAt: st.createdAt.toISOString(),
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
