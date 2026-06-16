import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-signature text-5xl text-primary">
          Dee-licious Bakes
        </p>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
