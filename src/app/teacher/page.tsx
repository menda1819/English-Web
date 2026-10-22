import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireTeacher } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { ResourceCard, ResourceData } from "@/components/ResourceCard";
import { ResourceFilters } from "@/components/ResourceFilters";
import { SproutIcon, OwlIcon } from "@/components/GardenIcons";
import {
  PlusCircle,
  FileText,
  Globe,
  FileEdit,
  Users,
  Activity as ActivityIcon,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher Dashboard",
  description: "Teacher administration portal for managing curriculum materials and students.",
};

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const teacher = await requireTeacher();
  const params = await searchParams;

  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const gradeFilter = typeof params.grade === "string" && params.grade ? parseInt(params.grade, 10) : null;
  const topicFilter = typeof params.topic === "string" && params.topic ? params.topic : null;
  const typeFilter = typeof params.type === "string" && params.type ? params.type : null;
  const statusFilter = typeof params.status === "string" && params.status ? params.status : null;
  const sortParam = typeof params.sort === "string" ? params.sort : "newest";

  await connectToDatabase();

  // Metrics
  const [totalResources, publishedCount, draftCount, totalStudents] = await Promise.all([
    Resource.countDocuments(),
    Resource.countDocuments({ publicationStatus: "published" }),
    Resource.countDocuments({ publicationStatus: "draft" }),
    User.countDocuments({ role: "student" }),
  ]);

  // Build Filter Query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { topic: { $regex: searchQuery, $options: "i" } },
      { tags: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (gradeFilter && !isNaN(gradeFilter)) {
    query.grades = gradeFilter;
  }

  if (topicFilter) {
    query.topic = topicFilter;
  }

  if (typeFilter) {
    query.type = typeFilter;
  }

  if (statusFilter === "published" || statusFilter === "draft") {
    query.publicationStatus = statusFilter;
  }

  // Sort
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortOption: any = { createdAt: -1 };
  if (sortParam === "oldest") sortOption = { createdAt: 1 };
  if (sortParam === "title") sortOption = { title: 1 };

  const resources = await Resource.find(query).sort(sortOption).lean();

  // Recent activity logs for teacher
  const recentActivities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100/90 border border-amber-200 px-3 py-1 rounded-full">
                Teacher Desk
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Signed in as {teacher.name}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Curriculum & Resource Center 🍎
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Upload, organize, preview, publish, and edit all your English materials for Grades 1–5.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/resources/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Plant New Resource</span>
            </Link>
            <Link
              href="/teacher/students"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-sm shadow-xs transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Students ({totalStudents})</span>
            </Link>
            <Link
              href="/teacher/profile"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-stone-700 font-bold text-sm shadow-xs transition-colors"
              title="Edit Teacher Profile & Password"
            >
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Materials
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {totalResources}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Published to Kids
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {publishedCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Private Drafts
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {draftCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Enrolled Students
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                {totalStudents}
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <ResourceFilters isTeacher={true} />

        {/* Resources Grid or Empty State */}
        {resources.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200 my-8">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
              <SproutIcon className="w-10 h-10" />
            </div>
            <h3
              className="text-xl font-bold text-stone-900 mb-2"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              No teaching resources found!
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
              {searchQuery || gradeFilter || topicFilter || statusFilter
                ? "Try clearing some filters or search keywords to see your materials."
                : "You have not uploaded any materials yet. Click below to plant your first worksheet, document, or lesson plan!"}
            </p>
            <Link
              href="/teacher/resources/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload First Resource</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {resources.map((r) => {
              const resData: ResourceData = {
                _id: r._id.toString(),
                title: r.title,
                description: r.description,
                grades: r.grades,
                topic: r.topic,
                type: r.type,
                tags: r.tags,
                instructions: r.instructions,
                publicationStatus: r.publicationStatus,
                safeFileName: r.safeFileName,
                fileSize: r.fileSize,
                mimeType: r.mimeType,
                teacherName: r.teacherName,
                createdAt: r.createdAt.toISOString(),
                publishedAt: r.publishedAt ? r.publishedAt.toISOString() : undefined,
              };
              return <ResourceCard key={resData._id} resource={resData} isTeacher={true} />;
            })}
          </div>
        )}

        {/* Audit Activity Card */}
        {recentActivities.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900" style={{ fontFamily: "var(--font-fredoka)" }}>
                Recent Classroom Activity
              </h3>
            </div>
            <div className="divide-y divide-stone-100">
              {recentActivities.map((act) => (
                <div key={act._id.toString()} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-stone-800">{act.details}</span>
                  </div>
                  <span className="text-stone-400">
                    {new Date(act.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
