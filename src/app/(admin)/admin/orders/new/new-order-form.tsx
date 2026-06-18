"use client";

import { AlertCircle, ArrowLeft, Calendar, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState, useTransition } from "react";
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

interface CustomerOption {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface NewOrderFormProps {
  customers: CustomerOption[];
}

export function NewOrderForm({ customers }: NewOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "delivery" | "collection"
  >("collection");
  const [fulfillmentDate, setFulfillmentDate] = useState("");
  const [status, setStatus] = useState<
    | "pending"
    | "paid"
    | "processing"
    | "ready_for_collection"
    | "completed"
    | "cancelled"
    | "refunded"
  >("pending");
  const [total, setTotal] = useState("0.00");

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId),
    [customers, customerId],
  );

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    const customer = customers.find((entry) => entry.id === value);
    if (!customer) {
      return;
    }

    setName(customer.name ?? "");
    setEmail(customer.email);
    setPhone(customer.phone ?? "");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await createManualOrderAction({
        customerSelection: customerId ? "existing" : "new",
        customerId: customerId || undefined,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        note: note.trim() || undefined,
        fulfillmentMethod,
        fulfillmentDate: fulfillmentDate || undefined,
        status,
        total,
      });

      if (result.success) {
        toast.success("Manual order created.");
        router.push("/admin/orders");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create order.");
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
          <Link href="/admin/orders" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
        </Button>
      </div>

      <div>
        <H1 className="font-heading">Create Manual Order</H1>
        <P className="text-muted-foreground text-sm">
          Register a direct order against an existing or new customer profile.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Customer Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Link to an existing customer or capture snapshot details for
                this order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="existing-customer"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Existing Customer
                </label>
                <select
                  id="existing-customer"
                  value={customerId}
                  onChange={(event) => handleCustomerChange(event.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Use entered contact details</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {`${customer.name || "Bake Lover"} (${customer.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="order-customer-name"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Customer Name
                  </label>
                  <input
                    id="order-customer-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="order-customer-email"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <input
                    id="order-customer-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="e.g. eleanor@example.com"
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="order-customer-phone"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Contact Phone Number
                </label>
                <input
                  id="order-customer-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="e.g. +44 7700 900077"
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Order Details
              </CardTitle>
              <CardDescription className="text-xs">
                Capture internal notes and a single manual total for the order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="order-note"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Internal Notes
                </label>
                <textarea
                  id="order-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Capture any bespoke notes, dietary requests, or collection instructions."
                  rows={4}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2 sm:max-w-xs">
                <label
                  htmlFor="order-total"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Total Amount (£)
                </label>
                <input
                  id="order-total"
                  type="number"
                  min="0"
                  step="0.01"
                  value={total}
                  onChange={(event) => setTotal(event.target.value)}
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Fulfillment Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="fulfillment-method"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Fulfillment Method
                </label>
                <select
                  id="fulfillment-method"
                  value={fulfillmentMethod}
                  onChange={(event) =>
                    setFulfillmentMethod(
                      event.target.value as "delivery" | "collection",
                    )
                  }
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="collection">Collection from Bakery</option>
                  <option value="delivery">Local Salisbury Delivery</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="fulfillment-date"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Target Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="fulfillment-date"
                    type="date"
                    value={fulfillmentDate}
                    onChange={(event) => setFulfillmentDate(event.target.value)}
                    disabled={isPending}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="order-status"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Order Initial Status
                </label>
                <select
                  id="order-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as
                        | "pending"
                        | "paid"
                        | "processing"
                        | "ready_for_collection"
                        | "completed"
                        | "cancelled"
                        | "refunded",
                    )
                  }
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_collection">
                    Ready for Collection
                  </option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      <span>Logging Order</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      <span>Log Order Booking</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/admin/orders">Cancel changes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/10 bg-amber-500/5">
            <CardContent className="pt-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                  Linked Customer
                </h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                  {selectedCustomer
                    ? `This order will be linked to ${selectedCustomer.name || selectedCustomer.email}.`
                    : "If no existing customer is selected, a customer profile is created from the entered email."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
