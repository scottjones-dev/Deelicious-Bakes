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

export function NewCustomerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await onboardCustomerAction({
        name: name.trim() || "Customer",
        email,
        phone: phone.trim() || undefined,
        marketingConsent,
      });

      if (result.success) {
        toast.success("Customer profile created.");
        router.push("/admin/customers");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create customer.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div>
        <H1 className="font-heading">Onboard New Customer</H1>
        <P className="text-muted-foreground text-sm">
          Register customer contact details and communication preferences.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Identity & Contact
              </CardTitle>
              <CardDescription className="text-xs">
                Core customer profile data used for order history and receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="customer-name"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Full Name
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="customer-email"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="e.g. eleanor@example.com"
                    required
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="customer-phone"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Phone Number
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="e.g. +44 7700 900077"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Customer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="marketing-consent"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Marketing Consent
                </label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    id="marketing-consent"
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) =>
                      setMarketingConsent(event.target.checked)
                    }
                    disabled={isPending}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                  />
                  <label
                    htmlFor="marketing-consent"
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
                  className="w-full cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      <span>Saving Customer</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      <span>Onboard Customer</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/admin/customers">Cancel changes</Link>
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
                  Customer records use the live CRM schema and appear immediately
                  in the customers directory.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
