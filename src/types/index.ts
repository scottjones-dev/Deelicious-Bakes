// src/types/index.ts
export interface StoredFile {
  id: string;      // Unique upload identifier
  name: string;    // Original file name
  url: string;     // CDN url (e.g., uploadthing CDN)
  key: string;     // S3 storage key
  size: number;    // File size in bytes
}
