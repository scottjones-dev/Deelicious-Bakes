"use client";

import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { H2, P } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";
import { appendAuthCallback } from "@/lib/auth-redirect";

export default function SettingsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const marketingConsentEnabled =
    "marketingConsent" in (session?.user ?? {}) &&
    session?.user.marketingConsent === true;

  useEffect(() => {
    if (!session) return;
    setMarketingConsent(marketingConsentEnabled);
  }, [marketingConsentEnabled, session]);

  if (sessionPending) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <P>Please sign in to update your account settings.</P>
        <Link
          href={appendAuthCallback("/sign-in", "/account/settings")}
          className="text-primary hover:underline"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const hasConsentChanged = marketingConsent !== marketingConsentEnabled;

  async function handleSavePreferences(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasConsentChanged) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/emails/preferences", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: session.user.name,
          subscribe: marketingConsent,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        subscribed?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to save preferences.");
      }

      setMarketingConsent(Boolean(data.subscribed));
      toast.success(data.message || "Preferences saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save preferences.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <H2 className="font-heading">Account Settings</H2>
        <P className="text-muted-foreground">
          Manage your profile, bakes, and communication preferences.
        </P>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="border-primary/10 shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading">Public Profile</CardTitle>
            <CardDescription>
              How others see you in the bakery community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="text-xl font-bold uppercase text-muted-foreground">
                  {session.user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left space-y-1">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">
                  Profile photo updates are disabled for account security.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSavePreferences}>
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={session.user.name}
                  disabled
                  className="bg-muted/50 border-primary/5 cursor-not-allowed"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={session.user.email}
                  disabled
                  className="bg-muted/50 border-primary/5 cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Email and profile details are managed by administrators only.
                </p>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-primary/10 p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="marketing-consent"
                      className="text-base font-heading"
                    >
                      Marketing Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new weekly bakes, seasonal donuts,
                      and cookie drops.
                    </p>
                  </div>
                  <Switch
                    id="marketing-consent"
                    name="marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={setMarketingConsent}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving || !hasConsentChanged}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
