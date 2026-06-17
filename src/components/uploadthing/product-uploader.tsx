"use client";

import Image from "next/image";
import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";

interface AdminProductUploaderProps {
  onImagesChanged: (imageObjects: Array<{ url: string; key: string }>) => void;
}

export function AdminProductPhotoManager({
  onImagesChanged,
}: AdminProductUploaderProps) {
  const [productPhotos, setProductPhotos] = useState<
    Array<{ url: string; key: string }>
  >([]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-neutral-300 p-6 bg-neutral-50/50">
        <UploadDropzone
          endpoint="adminProductUploader"
          onClientUploadComplete={(res) => {
            const newPhotos = res.map((file) => ({
              url: file.ufsUrl,
              key: file.key,
            }));
            const updatedList = [...productPhotos, ...newPhotos];
            setProductPhotos(updatedList);
            onImagesChanged(updatedList);
          }}
          onUploadError={(error: Error) => {
            console.error(`ERROR! ${error.message}`);
          }}
        />
      </div>

      {/* Display Asset Row with structural identification mapping */}
      {productPhotos.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-foreground mb-3 font-heading">
            Staged Product Assets
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {productPhotos.map((photo) => (
              <div
                key={photo.key}
                className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border shadow-sm bg-muted/10"
              >
                <Image
                  src={photo.url}
                  alt="Catalog display asset"
                  fill
                  className="object-cover"
                />

                {/* Clear utility node if an asset was uploaded incorrectly */}
                <button
                  type="button"
                  onClick={() => {
                    const filtered = productPhotos.filter(
                      (p) => p.key !== photo.key,
                    );
                    setProductPhotos(filtered);
                    onImagesChanged(filtered);
                  }}
                  className="absolute right-1 top-1 rounded bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground opacity-0 transition group-hover:opacity-100 shadow-md"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
