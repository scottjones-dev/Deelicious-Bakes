"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { appendAuthCallback, getAuthCallbackPath } from "@/lib/auth-redirect";

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRequestedVerification = useRef(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [message, setMessage] = useState("Verifying your email...");
  const token = searchParams.get("token");
  const callbackUrl = getAuthCallbackPath(searchParams);
  const successRedirectPath = callbackUrl;
  const signInHref = appendAuthCallback("/sign-in", callbackUrl);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "This verification link is missing a token or has already been used.",
      );
      return;
    }

    if (hasRequestedVerification.current) {
      return;
    }
    hasRequestedVerification.current = true;

    const verify = async () => {
      const { error } = await authClient.verifyEmail({
        query: { token },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email.");
        toast.error(error.message || "Verification failed");
      } else {
        setStatus("success");
        setMessage(
          "Your email has been successfully verified! You can now access all features.",
        );
        toast.success("Email verified!");
        setTimeout(() => router.replace(successRedirectPath), 3000);
      }
    };

    verify();
  }, [token, router, successRedirectPath]);

  return (
    <Card className="border-primary/10 shadow-lg text-center overflow-hidden">
      <CardHeader className="bg-muted/30 pb-8 pt-8 border-b border-primary/5">
        <CardTitle className="text-2xl font-heading text-foreground">
          Email Verification
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Confirming your security credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-10 pb-10 flex flex-col items-center gap-6">
        {status === "pending" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground font-heading text-xl font-medium">
                Success!
              </p>
              <p className="text-muted-foreground text-sm max-w-xs">
                {message}
              </p>
            </div>
            <Button
              className="mt-4 w-full bg-primary text-primary-foreground"
              onClick={() => router.replace(successRedirectPath)}
            >
              Continue
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <XCircle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground font-heading text-xl font-medium">
                Verification Failed
              </p>
              <p className="text-muted-foreground text-sm max-w-xs">
                {message}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full border-primary/20 hover:bg-primary/5"
              onClick={() => router.push(signInHref)}
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
