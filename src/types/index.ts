// src/types/index.ts

import type { SQL } from "drizzle-orm";
import type { ClientUploadedFileData } from "uploadthing/types";

export interface NavItem {
  title: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface DataTableFilterField<TData> {
  label: string;
  value: keyof TData;
  placeholder?: string;
  options?: Option[];
}

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;

export interface StoredFile {
  id: string; // Unique upload identifier
  name: string; // Original file name
  url: string; // CDN url (e.g., uploadthing CDN)
  key: string; // S3 storage key
  size: number; // File size in bytes
}
