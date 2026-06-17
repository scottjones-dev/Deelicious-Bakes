import { AlertCircle, ArrowLeft, Save, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
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
  return (
    <div className="space-y-6">
      {/* Go Back Link */}
      <div className="flex items-center gap-2">
        <Button
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
        {/* Main Details Form (Placeholder Grid) */}
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    disabled
                    className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. eleanor@example.com"
                    disabled
                    className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +44 7700 900077"
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Personalized Notes
              </CardTitle>
              <CardDescription className="text-xs">
                Store specific customer notes such as allergy records (e.g.
                nut-free) or cake flavor favorites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Operational Notes
                </label>
                <textarea
                  placeholder="e.g. Eleanor prefers dark chocolate sponges, lives locally in Salisbury. Gluten-free preferred."
                  rows={4}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none resize-none"
                />
              </div>
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
                    disabled
                    className="h-4 w-4 rounded border-border text-primary cursor-not-allowed"
                  />
                  <label
                    htmlFor="marketingConsent"
                    className="text-xs text-muted-foreground font-medium cursor-not-allowed select-none"
                  >
                    Subscribe to newsletter bakes
                  </label>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <Button disabled className="w-full cursor-not-allowed">
                  <Save className="h-4 w-4 mr-1.5" />
                  <span>Onboard Customer</span>
                </Button>
                <Button
                  variant="ghost"
                  disabled
                  className="w-full cursor-not-allowed text-muted-foreground"
                >
                  <span>Cancel changes</span>
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
    </div>
  );
}
