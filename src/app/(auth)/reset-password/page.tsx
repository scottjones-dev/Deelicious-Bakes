import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Signature } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Reset Password | Deelicious Bakes",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 py-6">
          <Signature className="text-primary text-5xl">
            Deelicious Bakes
          </Signature>
        </div>
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Preparing secure reset form...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
