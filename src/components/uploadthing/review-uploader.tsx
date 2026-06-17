"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";

interface ReviewPhotoProps {
  onPhotosUploaded: (urls: string[]) => void;
}

export function ReviewPhotoUploader({ onPhotosUploaded }: ReviewPhotoProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  return (
    <div className="rounded-lg border border-border p-4 bg-card shadow-sm">
      <label className="block text-sm font-medium text-muted-foreground mb-3 font-heading">
        {isCompressing
          ? "Optimizing photo quality..."
          : "Add photos of your delivery or custom cake!"}
      </label>

      <UploadButton
        endpoint="imageUploader"
        onBeforeUploadBegin={async (files) => {
          setIsCompressing(true);
          try {
            const compressionOptions = {
              maxSizeMB: 1.5,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };

            const compressedFiles = await Promise.all(
              files.map(async (file) => {
                try {
                  const compressedBlob = await imageCompression(
                    file,
                    compressionOptions,
                  );

                  return new File([compressedBlob], file.name, {
                    type: file.type,
                  });
                } catch (err) {
                  console.error("Compression error on file:", file.name, err);
                  return file;
                }
              }),
            );

            return compressedFiles;
          } finally {
            setIsCompressing(false);
          }
        }}
        onClientUploadComplete={(res) => {
          const urls = res.map((file) => file.ufsUrl);
          const combined = [...uploadedImages, ...urls];
          setUploadedImages(combined);
          onPhotosUploaded(combined);
        }}
        onUploadError={(error: Error) => {
          alert(`Could not attach review image: ${error.message}`);
        }}
        config={{
          mode: "auto",
        }}
        disabled={isCompressing}
        className="ut-button:bg-primary ut-button:ut-readying:bg-primary/70 ut-button:ut-uploading:bg-primary/50 ut-label:text-primary"
      />

      {/* Grid Previews */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {uploadedImages.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted/10"
            >
              <Image
                src={url}
                alt={`Uploaded product preview review number ${idx}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
