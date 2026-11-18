"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadToImgBB } from "@/lib/imgbb";

/**
 * Profile / menu-item image field. Uploads the chosen file to ImgBB and
 * returns the hosted URL — the file itself never touches our API.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Profile Image",
  hint,
  aspect = "square",
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  hint?: string;
  aspect?: "square" | "wide";
}) {
  const [uploading, setUploading] = useState(false);
  const inputId = `image-upload-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err: unknown) {
      toast.error("Image upload failed", {
        description:
          err instanceof Error ? err.message : "Please try another file.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <label
        htmlFor={inputId}
        className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gold/40 bg-gold/[0.04] transition-colors hover:border-gold hover:bg-gold/[0.08] ${
          aspect === "square" ? "h-28 w-28" : "h-36 w-full"
        }`}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded"
              fill
              sizes="112px"
              className="object-cover"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(undefined);
              }}
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-forest-deep/80 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : uploading ? (
          <Loader2 className="size-6 animate-spin text-gold" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="size-6 text-gold" />
            <span className="text-xs font-medium">Upload</span>
          </span>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
