"use client";

import React, { useState, useTransition } from "react";
import { deleteResourceAction } from "@/app/actions/resources";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export function DeleteButton({
  resourceId,
  resourceTitle,
}: {
  resourceId: string;
  resourceTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteResourceAction(resourceId);
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-stone-200 transition-colors cursor-pointer"
        title="Delete resource"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4
                className="text-lg font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Delete Resource?
              </h4>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-stone-900 font-semibold">&ldquo;{resourceTitle}&rdquo;</strong>?
              This will remove the file from remote storage and students will no longer be able to access it.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isPending ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
