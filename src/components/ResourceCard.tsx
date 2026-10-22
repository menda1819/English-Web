import React from "react";
import Link from "next/link";
import {
  FileText,
  FileCheck,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  Eye,
  Edit,
  Sparkles,
  Layers,
  Calendar,
} from "lucide-react";
import { PublishToggle } from "./PublishToggle";
import { DeleteButton } from "./DeleteButton";

export interface ResourceData {
  _id: string;
  title: string;
  description: string;
  grades: number[];
  topic: string;
  type: string;
  tags?: string[];
  instructions?: string;
  publicationStatus: "draft" | "published";
  safeFileName: string;
  fileSize: number;
  mimeType: string;
  teacherName?: string;
  createdAt: string | Date;
  publishedAt?: string | Date;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-rose-500" />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <FileCheck className="w-5 h-5 text-sky-500" />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return <FileSpreadsheet className="w-5 h-5 text-amber-500" />;
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
  return <FileText className="w-5 h-5 text-stone-500" />;
}

function getTopicColor(topic: string) {
  const t = topic.toLowerCase();
  if (t.includes("phon")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (t.includes("gram")) return "bg-sky-100 text-sky-800 border-sky-200";
  if (t.includes("read") || t.includes("compreh")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (t.includes("writ") || t.includes("creat")) return "bg-rose-100 text-rose-800 border-rose-200";
  if (t.includes("vocab") || t.includes("spell")) return "bg-purple-100 text-purple-800 border-purple-200";
  return "bg-teal-100 text-teal-800 border-teal-200";
}

export function ResourceCard({
  resource,
  isTeacher = false,
}: {
  resource: ResourceData;
  isTeacher?: boolean;
}) {
  const isDraft = resource.publicationStatus === "draft";
  const dateFormatted = new Date(resource.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className={`group relative flex flex-col justify-between bg-white rounded-3xl p-6 transition-all duration-200 border ${
        isDraft
          ? "border-dashed border-amber-300 bg-amber-50/20"
          : "border-stone-200/90 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Topic pill */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getTopicColor(
                resource.topic
              )}`}
            >
              {resource.topic}
            </span>

            {/* Type pill */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 capitalize border border-stone-200">
              {resource.type.replace("-", " ")}
            </span>
          </div>

          {/* Grades Badge */}
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {resource.grades.length === 1
                ? `Grade ${resource.grades[0]}`
                : `Grades ${resource.grades.sort().join(", ")}`}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          <Link href={isTeacher ? `/teacher/resources/${resource._id}/edit` : `/student/resources/${resource._id}`}>
            {resource.title}
          </Link>
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-stone-600 line-clamp-2 mb-4 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Teacher Instructions Preview (Student Friendly) */}
        {resource.instructions && (
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 line-clamp-2 italic">
              <strong>Teacher Note:</strong> {resource.instructions}
            </p>
          </div>
        )}

        {/* File attachment preview */}
        <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {getFileIcon(resource.mimeType)}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-700 truncate">
                {resource.safeFileName}
              </p>
              <p className="text-[11px] text-stone-400">{formatBytes(resource.fileSize)}</p>
            </div>
          </div>
          <a
            href={`/api/resources/${resource._id}/file?download=true`}
            className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
            title="Download file directly"
            download
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {dateFormatted}
          </span>
          {isTeacher && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                isDraft
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {resource.publicationStatus}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {/* Main View / Preview Action */}
          <Link
            href={
              isTeacher
                ? `/student/resources/${resource._id}`
                : `/student/resources/${resource._id}`
            }
            prefetch={false}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Open & Learn</span>
          </Link>

          {/* Teacher Specific Controls */}
          {isTeacher && (
            <div className="flex items-center gap-1">
              <PublishToggle
                resourceId={resource._id}
                currentStatus={resource.publicationStatus}
              />
              <Link
                href={`/teacher/resources/${resource._id}/edit`}
                className="p-2 text-stone-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl border border-stone-200 transition-colors"
                title="Edit Resource"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <DeleteButton
                resourceId={resource._id}
                resourceTitle={resource.title}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
