"use client";

import type { ErrorBoundaryProps } from "@/types/error";

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  console.error(error);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-semibold tracking-tight">
              Critical Application Error
            </h1>

            <p className="mt-4 text-muted-foreground">
              The application failed to load correctly.
            </p>

            <button
              type="button"
              onClick={() => reset()}
              className="mt-8 rounded-full bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reload Application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
