import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Save,
  ShoppingCart,
} from "lucide-react";
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

export default function AdminNewOrderPage() {
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
          <Link href="/admin/orders" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <H1 className="font-heading">Create Manual Order</H1>
        <P className="text-muted-foreground text-sm">
          Register a telephone booking, bespoke wedding cake consultation, or
          walk-in order.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Customer Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Link this order to an existing customer account or create a
                snapshot booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Customer Name
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
                  Contact Phone Number
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
                Bespoke Order Details
              </CardTitle>
              <CardDescription className="text-xs">
                Specify cake tiers, custom decorations, messaging, or dietary
                requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Confectionery Details & Custom Notes
                </label>
                <textarea
                  placeholder="Describe custom piping text, gluten-free requests, cake layers, flavor fillings..."
                  rows={4}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action and Timing panel */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Fulfillment Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Fulfillment Method
                </label>
                <select
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                >
                  <option>Collection from Bakery</option>
                  <option>Local Salisbury Delivery</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Target Date & Time
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    disabled
                    className="w-full pl-9 pr-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Order Initial Status
                </label>
                <select
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg cursor-not-allowed text-muted-foreground font-light focus:outline-none"
                >
                  <option>Pending</option>
                  <option>Paid (Bespoke deposit)</option>
                  <option>Processing (Baking queue)</option>
                </select>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <Button disabled className="w-full cursor-not-allowed">
                  <Save className="h-4 w-4 mr-1.5" />
                  <span>Log Order Booking</span>
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
                  Manual order entry triggers automatic email receipts via
                  Trigger.dev bakes sync processes when database configurations
                  are live.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
