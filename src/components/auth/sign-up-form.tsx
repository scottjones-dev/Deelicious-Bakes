"use client";
import { Loader2, MailCheck } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { H3, P } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");
  const callbackUrl =
    searchParams.get("callbackUrl") ??
    searchParams.get("callbackURL") ??
    "/account";
  const signInHref =
    callbackUrl === "/account"
      ? "/sign-in"
      : `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const marketingConsent = formData.get("marketing-consent") === "on";

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsPending(false);
      return;
    }

    const result = await authClient.signUp.email({
      email,
      password,
      name,
      // @ts-expect-error additional Better Auth field configured server-side
      marketingConsent,
      callbackURL: callbackUrl,
    });

    setIsPending(false);

    if (result.error) {
      toast.error(result.error.message || "Failed to create account");
      return;
    }

    setEmailSentTo(email);
    setIsSuccess(true);
    toast.success("Account created successfully!");
  }

  if (isSuccess) {
    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MailCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <H3 className="text-foreground font-heading">Check your email</H3>
            <P className="text-muted-foreground text-sm max-w-70">
              We've sent a verification link to{" "}
              <span className="text-primary font-medium">{emailSentTo}</span>.
              Please click it to activate your account.
            </P>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => router.push(signInHref)}
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props} className="border-primary/10 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-heading text-foreground">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your information below to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="bg-background/50"
              />
            </Field>
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="bg-background/50"
              />
            </Field>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="marketing-consent"
                name="marketing-consent"
                defaultChecked
                className="mt-1"
              />
              <Label
                htmlFor="marketing-consent"
                className="text-sm text-muted-foreground leading-snug cursor-pointer"
              >
                I want to receive marketing emails and updates about new bakes
              </Label>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Account
              </Button>

              <P className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={signInHref}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </P>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
