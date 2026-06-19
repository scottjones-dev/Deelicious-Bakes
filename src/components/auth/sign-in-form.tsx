"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { P } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";
import { appendAuthCallback, getAuthCallbackPath } from "@/lib/auth-redirect";

export function SigninForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const callbackUrl = getAuthCallbackPath(searchParams);
  const signUpHref = appendAuthCallback("/sign-up", callbackUrl);
  const forgotPasswordHref = appendAuthCallback(
    "/forgot-password",
    callbackUrl,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    setIsPending(false);

    if (result.error) {
      toast.error(result.error.message || "Invalid credentials");
      return;
    }

    toast.success("Signed in successfully!");
    router.push(callbackUrl);
  }

  return (
    <Card {...props} className="border-primary/10 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-heading text-foreground">
          Sign In
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-background/50"
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href={forgotPasswordHref}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
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
                Sign In
              </Button>

              <P className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href={signUpHref}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </P>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
