"use client";

import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { onboardCustomerAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, P } from "@/components/ui/typography";

export default function AdminNewCustomerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("Name and Email are required fields.");
      return;
    }

    startTransition(async () => {
      const res = await onboardCustomerAction({
        name,
        email,
        phone: phone || undefined,
        password: password || undefined,
        marketingConsent,
      });

      if (res.success) {
        toast.success(`Successfully onboarded customer "${name}"! 🎉`);
        router.push("/admin/customers");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to onboard customer.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto p-8">
      {/* Go Back Link */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Link href="/admin/customers" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customers</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <H1 className="font-heading">Onboard New Customer</H1>
        <P className="text-muted-foreground text-sm">
          Register a customer profile in your CRM-lite database to store
          preferences, custom order notes, and contact info.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Identity & Contact
              </CardTitle>
              <CardDescription className="text-xs">
                Essential details required for billing, delivery notifications,
                and order logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. eleanor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +44 7700 900077"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Optional (auto-generated if empty)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Account Information
              </CardTitle>
              <CardDescription className="text-xs">
                Manual additions will also be registered in Better Auth,
                allowing the user to sign in to the storefront with this email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <P className="text-xs text-muted-foreground">
                Once onboarded, an automated Stripe Customer profile and Resend
                contact will be synchronized in the background via Trigger.dev
                pipelines.
              </P>
            </CardContent>
          </Card>
        </div>

        {/* Marketing and Actions Sidebar */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Customer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Marketing Consent
                </label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer focus:ring-0 focus:ring-offset-0"
                  />
                  <label
                    htmlFor="marketingConsent"
                    className="text-xs text-muted-foreground font-medium cursor-pointer select-none"
                  >
                    Subscribe to newsletter bakes
                  </label>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full cursor-pointer h-10"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      <span>Saving Customer...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      <span>Onboard Customer</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setPhone("");
                    setPassword("");
                    setMarketingConsent(false);
                  }}
                  disabled={isPending}
                  className="w-full text-muted-foreground cursor-pointer h-10"
                >
                  <span>Reset Form</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/10 bg-amber-500/5">
            <CardContent className="pt-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                  Operations Guard
                </h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                  Manual CRM additions are stored locally. Full automated
                  storefront customer syncing is active for organic sign-ups.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
