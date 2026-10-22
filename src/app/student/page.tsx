import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireStudent } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Link from "next/link";
import { ResourceCard, ResourceData } from "@/components/ResourceCard";
import { ResourceFilters } from "@/components/ResourceFilters";
import { SproutIcon, FlowerIcon, BeeIcon } from "@/components/GardenIcons";
import { UserAvatar } from "@/components/UserAvatar";
import { Sparkles, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My English Learning Garden",
  description: "Browse worksheets, phonics, stories, and grammar activities for primary grades.",
};

export default async function StudentLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireStudent();
  const params = await searchParams;

  await connectToDatabase();

  const isTeacher = session.role === "teacher";

  // Fetch fresh student document to get the latest permissions set by teacher
  const studentDoc = !isTeacher ? await User.findById(session.userId).lean() : null;

  const studentPrimaryGrade = studentDoc?.grade || session.grade || 1;
  const accessAllGrades = isTeacher || Boolean(studentDoc?.accessAllGrades);

  // Compute permitted grades for this student:
  // If teacher granted accessAllGrades -> [1, 2, 3, 4, 5]
  // Else -> enrolled primary grade + any specific grades granted by teacher
  const permittedGrades: number[] = accessAllGrades
    ? [1, 2, 3, 4, 5]
    : Array.from(
        new Set([studentPrimaryGrade, ...(studentDoc?.allowedGrades || [])])
      ).sort();

  const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
  const gradeParam = typeof params.grade === "string" ? params.grade : undefined;

  let gradeFilter: number | null = null;
  if (gradeParam) {
    const parsed = parseInt(gradeParam, 10);
    // Student can only filter by a grade they are permitted to view
    if (!isNaN(parsed) && (isTeacher || permittedGrades.includes(parsed))) {
      gradeFilter = parsed;
    }
  }

  const topicFilter = typeof params.topic === "string" && params.topic ? params.topic : null;
  const typeFilter = typeof params.type === "string" && params.type ? params.type : null;
  const sortParam = typeof params.sort === "string" ? params.sort : "newest";

  // Strict server-side query enforcement:
  // 1. MUST BE PUBLISHED
  // 2. MUST BE FOR PERMITTED GRADES ONLY
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    publicationStatus: "published",
  };

  if (isTeacher) {
    if (gradeFilter) {
      query.grades = gradeFilter;
    }
  } else {
    if (gradeFilter && permittedGrades.includes(gradeFilter)) {
      query.grades = gradeFilter;
    } else {
      // Strictly restrict student queries to their permitted grades only
      query.grades = { $in: permittedGrades };
    }
  }

  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { topic: { $regex: searchQuery, $options: "i" } },
      { tags: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (topicFilter) {
    query.topic = topicFilter;
  }

  if (typeFilter) {
    query.type = typeFilter;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortOption: any = { createdAt: -1 };
  if (sortParam === "oldest") sortOption = { createdAt: 1 };
  if (sortParam === "title") sortOption = { title: 1 };

  const resources = await Resource.find(query).sort(sortOption).lean();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Whimsical Welcoming Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 overflow-hidden">
          <div className="absolute -right-6 -bottom-8 opacity-20 pointer-events-none">
            <SproutIcon className="w-56 h-56" />
          </div>
          <div className="absolute top-4 right-12 opacity-80 animate-garden-float hidden sm:block">
            <BeeIcon className="w-12 h-12" />
          </div>

          <div className="relative z-10 flex items-start sm:items-center gap-4 sm:gap-5">
            <UserAvatar
              avatar={studentDoc?.avatar || session.avatar}
              name={session.name}
              size="xl"
            />

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isTeacher
                    ? "Teacher Preview Mode"
                    : accessAllGrades
                    ? "🌟 All Grades Access Permitted by Teacher"
                    : permittedGrades.length > 1
                    ? `Grade ${studentPrimaryGrade} • Extra Access: Grades ${permittedGrades.filter(g => g !== studentPrimaryGrade).join(", ")}`
                    : `Grade ${studentPrimaryGrade} Learning Garden`}
                </span>
              </div>

              <h1
                className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Hello, {session.name}! 🌻
              </h1>
              <p className="text-emerald-50 text-xs sm:text-sm mt-1.5 font-medium max-w-xl leading-relaxed">
                {accessAllGrades
                  ? "Your teacher has granted you full access to explore materials across all grades (1–5)!"
                  : permittedGrades.length > 1
                  ? `You have access to your Grade ${studentPrimaryGrade} materials plus extra unlocked grades (${permittedGrades.join(", ")}).`
                  : `Here are your Grade ${studentPrimaryGrade} English materials carefully chosen by your teacher.`}
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar restricted to permitted grades */}
        <ResourceFilters
          isTeacher={isTeacher}
          studentGrade={studentPrimaryGrade}
          permittedGrades={permittedGrades}
          accessAllGrades={accessAllGrades}
        />

        {/* Resource Grid or Friendly Empty State */}
        {resources.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-emerald-200 my-8 shadow-xs">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 mx-auto flex items-center justify-center mb-4">
              <FlowerIcon className="w-12 h-12 text-emerald-500 animate-garden-wiggle" />
            </div>
            <h3
              className="text-2xl font-bold text-stone-900 mb-2"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Your teacher hasn&apos;t added anything here yet! 🌱
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery || gradeFilter || topicFilter
                ? "We could not find any worksheets with those filters. Try clearing your search!"
                : "Check back soon! Your teacher will add new worksheets, stories, and activities here for you."}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Showing {resources.length} {resources.length === 1 ? "Garden Material" : "Garden Materials"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                return <ResourceCard key={resData._id} resource={resData} isTeacher={false} />;
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
