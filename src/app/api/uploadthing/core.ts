import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. Standard Customer Endpoints (Avatars, Reviews, etc.)
  imageUploader: f({
    image: {
      // Increased to 32MB to seamlessly allow massive iPhone ProRAW/48MP files
      // before your client-side worker compresses them down.
      maxFileSize: "32MB",
      maxFileCount: 4,
    },
  })
    .middleware(async ({ req }) => {
      const sessionData = await auth.api.getSession({
        headers: await headers(),
      });
      const user = sessionData?.user;
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // 2. Heavy-Duty Admin Product Asset Endpoint
  adminProductUploader: f({
    image: {
      // Massive roof limit specifically for your heavy, uncompressed DSLR or asset dumps
      maxFileSize: "64MB",
      maxFileCount: 6, // Allows up to 6 angles per product/listing
    },
  })
    .middleware(async ({ req }) => {
      const sessionData = await auth.api.getSession({
        headers: await headers(),
      });
      const user = sessionData?.user;

      // Guard: Ensure user is logged in
      if (!user) throw new UploadThingError("Unauthorized");

      // Optional Rule: If you set up an admin flag down the line in Better Auth, check it here:
      if (user.role !== "admin") throw new UploadThingError("Forbidden");

      return { adminId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "High-res product asset processed for admin:",
        metadata.adminId,
      );
      return { uploadedBy: metadata.adminId, url: file.ufsUrl };
    }),

  // 3. Custom Order Attachment Endpoint (Supports sketches, inspiration, and PDFs)
  customOrderUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 4 },
    pdf: { maxFileSize: "16MB", maxFileCount: 2 },
  })
    .middleware(async ({ req }) => {
      const sessionData = await auth.api.getSession({
        headers: await headers(),
      });
      const user = sessionData?.user;
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
