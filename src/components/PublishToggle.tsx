"use client";

import React, { useTransition } from "react";
import { togglePublicationAction } from "@/app/actions/resources";
import { Globe, EyeOff, Loader2 } from "lucide-react";

export function PublishToggle({
  resourceId,
  currentStatus,
}: {
  resourceId: string;
  currentStatus: "draft" | "published";
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    startTransition(async () => {
      await togglePublicationAction(resourceId, nextStatus);
    });
  };

  const isPublished = currentStatus === "published";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
        isPublished
          ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
          : "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
      }`}
      title={isPublished ? "Unpublish to Draft" : "Publish to Student Garden"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
      ) : isPublished ? (
        <Globe className="w-4 h-4" />
      ) : (
        <EyeOff className="w-4 h-4" />
      )}
    </button>
  );
}
