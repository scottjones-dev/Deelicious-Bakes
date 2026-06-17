"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Missing reset token");
      setIsPending(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsPending(false);
      return;
    }

    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setIsPending(false);

    if (result.error) {
      toast.error(result.error.message || "Failed to reset password");
      return;
    }

    toast.success("Password reset successfully!");
    router.push("/sign-in");
  }

  return (
    <Card {...props} className="border-primary/10 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-heading text-foreground">
          Reset Password
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-background/50"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="bg-background/50"
              />
            </Field>

            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Reset Password
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
