"use client";

import { AlertCircle, ArrowLeft, Calendar, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createManualOrderAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, P } from "@/components/ui/typography";
import type { OrderFulfillmentMethod, OrderStatus } from "@/db/schema";

interface CustomerOption {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface CreateOrderFormProps {
  customersList: CustomerOption[];
}

export function CreateOrderForm({ customersList }: CreateOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Customer Selection States
  const [customerSelection, setCustomerSelection] = useState<
    "existing" | "new"
  >("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // Profile Details (State / Auto-filled)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Order Details
  const [note, setNote] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<OrderFulfillmentMethod>("collection");
  const [fulfillmentDate, setFulfillmentDate] = useState("");
  const [fulfillmentTimeSlot, setFulfillmentTimeSlot] = useState(
    "Morning (09:00 - 12:00)",
  );
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [total, setTotal] = useState("");

  const isOrderFulfillmentMethod = (
    value: string,
  ): value is OrderFulfillmentMethod =>
    value === "collection" || value === "delivery";

  const isOrderStatus = (value: string): value is OrderStatus =>
    value === "pending" ||
    value === "paid" ||
    value === "processing" ||
    value === "ready_for_collection" ||
    value === "completed" ||
    value === "cancelled" ||
    value === "refunded";

  // Handle Existing Customer Selection
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const selected = customersList.find((c) => c.id === customerId);
    if (selected) {
      setName(selected.name || "Bake Lover");
      setEmail(selected.email);
      setPhone(selected.phone || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (customerSelection === "existing" && !selectedCustomerId) {
      toast.error("Please select an existing customer profile.");
      return;
    }

    if (!name || !email) {
      toast.error("Customer name and email are required.");
      return;
    }

    if (!total || Number.isNaN(Number(total)) || Number(total) <= 0) {
      toast.error(
        "Please enter a valid order total amount (greater than zero).",
      );
      return;
    }

    startTransition(async () => {
      const res = await createManualOrderAction({
        customerSelection,
        customerId:
          customerSelection === "existing" ? selectedCustomerId : undefined,
        name,
        email,
        phone: phone || undefined,
        note: note || undefined,
        fulfillmentMethod,
        fulfillmentDate: fulfillmentDate || undefined,
        fulfillmentTimeSlot: fulfillmentTimeSlot || undefined,
        total: parseFloat(total).toFixed(2),
        status,
      });

      if (res.success) {
        toast.success(`Successfully logged manual order! 🥐`);
        router.push("/admin/orders");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to log order.");
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
                Customer Profile Link
              </CardTitle>
              <CardDescription className="text-xs">
                Link this order to an existing customer account or record guest
                details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Link Option Toggle */}
              <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="customerSelection"
                    checked={customerSelection === "existing"}
                    onChange={() => {
                      setCustomerSelection("existing");
                      handleCustomerChange(selectedCustomerId);
                    }}
                    className="h-4 w-4 text-primary focus:ring-0"
                  />
                  <span>Existing Customer</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="customerSelection"
                    checked={customerSelection === "new"}
                    onChange={() => {
                      setCustomerSelection("new");
                      setName("");
                      setEmail("");
                      setPhone("");
                    }}
                    className="h-4 w-4 text-primary focus:ring-0"
                  />
                  <span>New / Guest Customer</span>
                </label>
              </div>

              {/* Customer Selector if Existing */}
              {customerSelection === "existing" && (
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Select Customer Profile
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 cursor-pointer"
                  >
                    <option value="">-- Choose registered customer --</option>
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || "Bake Lover"} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Readonly/Input Profile details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Customer Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={customerSelection === "existing"}
                    className="w-full h-10 px-3 py-2 text-sm bg-card disabled:bg-muted/40 disabled:text-muted-foreground border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
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
                    disabled={customerSelection === "existing"}
                    className="w-full h-10 px-3 py-2 text-sm bg-card disabled:bg-muted/40 disabled:text-muted-foreground border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={customerSelection === "existing"}
                  className="w-full h-10 px-3 py-2 text-sm bg-card disabled:bg-muted/40 disabled:text-muted-foreground border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
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
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 resize-none"
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
                Fulfillment & Price
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Price / Cost */}
              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Total Price (GBP £){" "}
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 45.00"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    className="w-full pl-7 pr-3 h-10 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 font-bold"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Fulfillment Method
                </label>
                <select
                  value={fulfillmentMethod}
                  onChange={(e) => {
                    if (isOrderFulfillmentMethod(e.target.value)) {
                      setFulfillmentMethod(e.target.value);
                    }
                  }}
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 cursor-pointer"
                >
                  <option value="collection">Collection from Bakery</option>
                  <option value="delivery">Local Salisbury Delivery</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Target Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={fulfillmentDate}
                    onChange={(e) => setFulfillmentDate(e.target.value)}
                    className="w-full pl-9 pr-3 h-10 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Time Slot Option
                </label>
                <select
                  value={fulfillmentTimeSlot}
                  onChange={(e) => setFulfillmentTimeSlot(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="Morning (09:00 - 12:00)">
                    Morning (09:00 - 12:00)
                  </option>
                  <option value="Afternoon (12:00 - 15:00)">
                    Afternoon (12:00 - 15:00)
                  </option>
                  <option value="Late Pick-up (15:00 - 17:00)">
                    Late Pick-up (15:00 - 17:00)
                  </option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Order Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    if (isOrderStatus(e.target.value)) {
                      setStatus(e.target.value);
                    }
                  }}
                  className="w-full h-10 px-3 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_collection">
                    Ready for Collection
                  </option>
                  <option value="completed">Completed</option>
                </select>
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
                      <span>Saving Order...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      <span>Log Order Booking</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelectedCustomerId("");
                    setName("");
                    setEmail("");
                    setPhone("");
                    setNote("");
                    setTotal("");
                    setFulfillmentMethod("collection");
                    setFulfillmentDate("");
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
                  Manual order entry triggers automatic email receipts via
                  Trigger.dev bakes sync processes when database configurations
                  are live.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
