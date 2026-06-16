"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { H3, P } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [emailSentTo, setEmailSentTo] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        const result = await authClient.requestPasswordReset({
            email,
            redirectTo: "/reset-password",
        });

        setIsPending(false);

        if (result.error) {
            toast.error(result.error.message || "Failed to send reset link");
            return;
        }

        setEmailSentTo(email);
        setIsSuccess(true);
        toast.success("Reset link sent!");
    }

    if (isSuccess) {
        return (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <MailCheck className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <H3 className="text-foreground font-heading">Link Sent</H3>
                        <P className="text-muted-foreground text-sm max-w-70">
                            We've sent a password reset link to <span className="text-primary font-medium">{emailSentTo}</span>.
                        </P>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => window.location.href = "/sign-in"}
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
                <CardTitle className="text-2xl font-heading text-foreground">Forgot Password</CardTitle>
                <CardDescription className="text-muted-foreground">Enter your email and we'll send you a link to reset your password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup className="gap-4">
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50" />
                        </Field>

                        <div className="flex flex-col gap-4 pt-4">
                            <Button type="submit" disabled={isPending} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Send Reset Link
                            </Button>

                            <P className="text-center text-xs text-muted-foreground">
                                Remembered your password?{" "}
                                <a href="/sign-in" className="text-primary hover:underline font-medium">
                                    Back to sign in
                                </a>
                            </P>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
