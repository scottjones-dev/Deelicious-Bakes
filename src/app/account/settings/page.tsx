"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, P } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";
import { UserAvatarUploader } from "@/components/uploadthing/avatar-uploader";

export default function SettingsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  if (sessionPending) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const marketingConsent = formData.get("marketing-consent") === "on";

    const { error } = await authClient.updateUser({
      name,
      // @ts-ignore - marketingConsent is an additionalField
      marketingConsent,
    });

    setIsUpdating(false);

    if (error) {
      toast.error(error.message || "Failed to update profile");
      return;
    }

    toast.success("Profile updated successfully! 🥐");
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <H2 className="font-heading">Account Settings</H2>
        <P className="text-muted-foreground">Manage your profile, bakes, and communication preferences.</P>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="border-primary/10 shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading">Public Profile</CardTitle>
            <CardDescription>How others see you in the bakery community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
               <UserAvatarUploader 
                 currentImage={session.user.image} 
                 fallbackName={session.user.name} 
               />
               <div className="text-center sm:text-left space-y-1">
                 <p className="text-sm font-medium">Profile Photo</p>
                 <p className="text-xs text-muted-foreground">Click the circle to upload a new photo.</p>
               </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={session.user.name} 
                  required 
                  className="bg-background/50 border-primary/10"
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
                <p className="text-[10px] text-muted-foreground italic">Email changes are coming soon.</p>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-primary/10 p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-consent" className="text-base font-heading">Marketing Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new weekly bakes, seasonal donuts, and cookie drops.
                    </p>
                  </div>
                  <Switch 
                    id="marketing-consent" 
                    name="marketing-consent" 
                    defaultChecked={(session.user as any).marketingConsent}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdating} className="bg-primary text-primary-foreground">
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
{/* TODO Remove this as customers wont see stripe this is admin only needs moved to admin */}
        {/* Security / Subscription Status */}
        <Card className="border-primary/10 shadow-sm bg-card/50 border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="font-heading">Billing & Subscriptions</CardTitle>
            <CardDescription>Manage your payments and Stripe customer portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <P className="text-sm">
                Access your Stripe portal to view receipts, manage payment methods, and see your subscription history.
              </P>
              <Button variant="outline" className="w-fit border-accent text-accent hover:bg-accent/10" disabled>
                Open Stripe Portal (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
