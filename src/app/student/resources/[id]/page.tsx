import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { SproutIcon, FlowerIcon } from "@/components/GardenIcons";
import {
  Download,
  ArrowLeft,
  Sparkles,
  Layers,
  Calendar,
  FileText,
  FileCheck,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();
  const resource = await Resource.findById(id).lean();
  return {
    title: resource ? resource.title : "Resource Details",
  };
}

export default async function StudentResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  await connectToDatabase();
  const resource = await Resource.findById(id).lean();

  if (!resource) {
    notFound();
  }

  // Strictly enforce that students can ONLY view published resources matching their permitted grades
  const isTeacher = session?.role === "teacher";
  if (!isTeacher) {
    if (resource.publicationStatus !== "published") {
      notFound();
    }

    const studentDoc = await User.findById(session?.userId).lean();
    const studentPrimaryGrade = studentDoc?.grade || session?.grade || 1;
    const accessAllGrades = Boolean(studentDoc?.accessAllGrades);
    const permittedGrades = accessAllGrades
      ? [1, 2, 3, 4, 5]
      : Array.from(
          new Set([studentPrimaryGrade, ...(studentDoc?.allowedGrades || [])])
        );

    const hasGradeAccess = resource.grades.some((g: number) =>
      permittedGrades.includes(g)
    );

    if (!hasGradeAccess) {
      notFound();
    }
  }

  const isPdf = resource.mimeType.includes("pdf");
  const isImage = resource.mimeType.startsWith("image/");
  const isDoc =
    resource.mimeType.includes("word") || resource.mimeType.includes("document");
  const isSlides =
    resource.mimeType.includes("presentation") || resource.mimeType.includes("powerpoint");

  const fileApiUrl = `/api/resources/${resource._id.toString()}/file`;
  const downloadUrl = `/api/resources/${resource._id.toString()}/file?download=true`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={isTeacher ? "/teacher" : "/student"}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTeacher ? "Back to Teacher Desk" : "Back to Learning Library"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              {resource.grades.length === 1
                ? `Grade ${resource.grades[0]}`
                : `Grades ${resource.grades.sort().join(", ")}`}
            </span>
            <span className="text-xs font-bold text-stone-700 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full capitalize">
              {resource.type.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Resource Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-2">
                {resource.topic}
              </span>
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {resource.title}
              </h1>
              {resource.description && (
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {resource.description}
                </p>
              )}
            </div>

            {/* Direct Download Button */}
            <a
              href={downloadUrl}
              download={resource.safeFileName}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Worksheet</span>
            </a>
          </div>

          {/* Teacher's Note / Speech Bubble */}
          {resource.instructions && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                  {resource.teacherName ? `${resource.teacherName} says:` : "Teacher's Note:"}
                </p>
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  {resource.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-stone-400 font-semibold mr-1">Tags:</span>
              {resource.tags.map((t: string) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Live Preview Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
          <h2
            className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            <FlowerIcon className="w-5 h-5 text-emerald-600" />
            <span>Educational Material Viewer</span>
          </h2>

          {isPdf ? (
            <div className="w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
              <iframe
                src={`${fileApiUrl}#toolbar=1`}
                title={resource.title}
                className="w-full h-[650px] border-0"
              />
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileApiUrl}
                alt={resource.title}
                className="max-h-[600px] w-auto rounded-xl object-contain shadow-xs"
              />
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center mb-4">
                {isDoc ? (
                  <FileCheck className="w-8 h-8" />
                ) : isSlides ? (
                  <FileSpreadsheet className="w-8 h-8" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
              </div>
              <h3
                className="text-xl font-bold text-stone-900 mb-2"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {resource.safeFileName}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
                This document is prepared in {isDoc ? "Word Document" : isSlides ? "Slide Presentation" : "document"} format.
                Click below to download and open it on your device.
              </p>
              <a
                href={downloadUrl}
                download={resource.safeFileName}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {resource.safeFileName}</span>
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
