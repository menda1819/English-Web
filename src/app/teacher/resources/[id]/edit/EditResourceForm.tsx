"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateResourceAction, ResourceActionResult } from "@/app/actions/resources";
import { TOPICS, RESOURCE_TYPES } from "@/components/ResourceFilters";
import { ResourceData } from "@/components/ResourceCard";
import { DeleteButton } from "@/components/DeleteButton";
import {
  Upload,
  FileCheck,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Tag,
  Globe,
  FileEdit,
} from "lucide-react";

export function EditResourceForm({ resource }: { resource: ResourceData }) {
  const router = useRouter();
  const [selectedGrades, setSelectedGrades] = useState<number[]>(resource.grades || [1]);
  const [publicationStatus, setPublicationStatus] = useState<"draft" | "published">(
    resource.publicationStatus
  );
  const [selectedTopic, setSelectedTopic] = useState(
    TOPICS.includes(resource.topic) ? resource.topic : "__other__"
  );
  const [customTopic, setCustomTopic] = useState(
    TOPICS.includes(resource.topic) ? "" : resource.topic
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const boundUpdateAction = updateResourceAction.bind(null, resource._id);
  const [state, formAction, isPending] = useActionState<ResourceActionResult | null, FormData>(
    boundUpdateAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      router.push("/teacher");
    }
  }, [state, router]);

  const toggleGrade = (g: number) => {
    if (selectedGrades.includes(g)) {
      if (selectedGrades.length > 1) {
        setSelectedGrades(selectedGrades.filter((item) => item !== g));
      }
    } else {
      setSelectedGrades([...selectedGrades, g].sort());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xl max-w-3xl w-full mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            Edit Resource ✏️
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Update metadata, replace file, or adjust publication status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton resourceId={resource._id} resourceTitle={resource.title} />
          <Link
            href="/teacher"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p>{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Resource Title *
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={resource.title}
            className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Grades Multi-Select */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Target Grade(s) *
          </label>
          {selectedGrades.map((g) => (
            <input key={g} type="hidden" name="grades" value={g} />
          ))}
          <div className="flex flex-wrap gap-2.5">
            {[1, 2, 3, 4, 5].map((g) => {
              const isSelected = selectedGrades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGrade(g)}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  Grade {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Topic *
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {TOPICS.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
              <option value="__other__">+ Custom Topic</option>
            </select>
            {selectedTopic === "__other__" ? (
              <input
                type="text"
                name="topic"
                required
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Type your custom topic..."
                className="mt-2 w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <input type="hidden" name="topic" value={selectedTopic} />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Category / Type *
            </label>
            <select
              name="type"
              defaultValue={resource.type}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={resource.description}
            className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Instructions for Children</span>
          </label>
          <textarea
            name="instructions"
            rows={2}
            defaultValue={resource.instructions}
            className="w-full px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-stone-400" />
            <span>Tags (comma-separated)</span>
          </label>
          <input
            type="text"
            name="tags"
            defaultValue={resource.tags?.join(", ")}
            className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Replace File Box (Optional) */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Replace File Attachment (Optional — leaves current file if untouched)
          </label>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 mb-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-stone-700">Current file:</span>
              <span className="text-stone-500">{resource.safeFileName}</span>
            </div>
            <a
              href={`/api/resources/${resource._id}/file?download=true`}
              className="text-emerald-700 hover:underline font-bold"
              download
            >
              Download Existing
            </a>
          </div>

          <div className="relative border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-3xl p-5 text-center transition-colors bg-stone-50/40">
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.svg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <Upload className="w-5 h-5 text-stone-400 mb-1" />
              {selectedFile ? (
                <p className="text-xs font-bold text-emerald-700">
                  New file selected: {selectedFile.name}
                </p>
              ) : (
                <p className="text-xs text-stone-500 font-medium">
                  Click or drag here if you want to replace with a new file version
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Publication Status */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Publication Status
          </label>
          <input type="hidden" name="publicationStatus" value={publicationStatus} />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPublicationStatus("published")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                publicationStatus === "published"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-xs sm:text-sm">Published</p>
                <p className="text-[11px] text-stone-500">Live in student learning garden</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPublicationStatus("draft")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                publicationStatus === "draft"
                  ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <FileEdit className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-xs sm:text-sm">Draft</p>
                <p className="text-[11px] text-stone-500">Private to teacher desk</p>
              </div>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            href="/teacher"
            className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isPending ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
