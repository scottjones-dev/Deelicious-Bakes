"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ErrorBoundaryProps } from "@/types/error";

export default function ErrorPage({ error, reset }: ErrorBoundaryProps) {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    setAttempts((prev) => prev + 1);
    reset();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-signature text-5xl text-primary">Deelicious Bakes</p>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
          Something Went Wrong
        </h1>

        <p className="mt-4 text-muted-foreground">
          An unexpected error occurred while loading this page.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          {attempts < 2 ? (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                The problem persists. Please return to the homepage.
              </p>

              <Link
                href="/"
                className="rounded-full bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
              >
                Go Home
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
