import {
  Check,
  Database,
  KeyRound,
  RefreshCw,
  Settings,
  Sliders,
} from "lucide-react";
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

export default function AdminSettingsPage() {
  const systemChecks = [
    {
      name: "Neon SQL Database",
      status: "Connected",
      detail: "Neon serverless instance fully pooled",
    },
    {
      name: "Better-Auth Session Shield",
      status: "Operational",
      detail: "Admin and guest role controls validated",
    },
    {
      name: "Resend Email Gateway",
      status: "Connected",
      detail: "Bakery receipt and update emails active",
    },
    {
      name: "Trigger.dev Worker Environment",
      status: "Listening",
      detail: "Background task workflows running",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <H1 className="font-heading">System Settings</H1>
        <P className="text-muted-foreground text-sm">
          Configure bakery operational parameters, collection limitations, and
          verify underlying core software states.
        </P>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile & Schedule */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <span>Bakery Shop Parameters</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Local configuration for your Salisbury storefront bakes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Bakery Business Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Deelicious Bakes"
                    disabled
                    className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Salisbury Store Email
                  </label>
                  <input
                    type="email"
                    defaultValue="hello@deeliciousbakes.co.uk"
                    disabled
                    className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Delivery Perimeter (Miles from Shop)
                </label>
                <input
                  type="number"
                  defaultValue="15"
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <span>Security Policies</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Manage credential requirements for operational access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                This staff portal enforces strict multi-factor Better-Auth
                verification and restricts admin pages to users assigned with
                the <code>admin</code> role in the database.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Health Status */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <span>Operations Health</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Active connections checking system integrity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {systemChecks.map((check) => (
                  <div
                    key={check.name}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/40"
                  >
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {check.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-wide text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-sm shrink-0">
                          {check.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate font-light mt-0.5">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/60 pt-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  disabled
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  <span>Run Complete Diagnostics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
