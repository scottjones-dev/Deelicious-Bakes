"use client";

import { useState } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

interface AvatarProps {
  currentImage?: string | null;
  fallbackName: string;
}

export function UserAvatarUploader({
  currentImage,
  fallbackName,
}: AvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage || null,
  );

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      const newUrl = res?.[0]?.ufsUrl; // Using modern ufsUrl property
      if (newUrl) {
        setPreviewUrl(newUrl);

        // FIX: Call the direct root updater pattern from the Better Auth specification
        await authClient.updateUser({
          image: newUrl,
        });
      }
    },
    onUploadError: (error) => {
      alert(`Avatar sync failed: ${error.message}`);
    },
  });

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await startUpload([file]);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={isUploading}
        onClick={handleAvatarClick}
        className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted/30 transition hover:border-primary disabled:opacity-50"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="User avatar preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold uppercase text-muted-foreground">
            {fallbackName.slice(0, 2)}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition group-hover:opacity-100">
          <p className="text-xs font-medium text-foreground">
            {isUploading ? "Uploading..." : "Change"}
          </p>
        </div>
      </button>
    </div>
  );
}
