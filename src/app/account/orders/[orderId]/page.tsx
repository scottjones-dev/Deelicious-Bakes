import { eq } from "drizzle-orm";
import {
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H2 } from "@/components/ui/typography";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  // 1. Fetch server session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // 2. Fetch specific order with relations
  const orderDetails = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      customer: true,
      items: true,
      deliveryAddress: true,
      billingAddress: true,
    },
  });

  if (!orderDetails) {
    notFound();
  }

  // 3. Security check: Ensure order belongs to logged-in user
  const isOwner =
    orderDetails.customer.userId === session.user.id ||
    orderDetails.customer.email.toLowerCase() ===
      session.user.email.toLowerCase();

  if (!isOwner) {
    redirect("/account/orders");
  }

  const formattedPlacedDate = new Date(
    orderDetails.createdAt,
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedFulfillmentDate = orderDetails.fulfillmentDate
    ? new Date(orderDetails.fulfillmentDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/10";
      case "paid":
        return "bg-blue-500/10 text-blue-600 border-blue-500/10";
      case "processing":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/10";
      case "ready_for_collection":
        return "bg-amber-500/10 text-amber-600 border-amber-500/10";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/10";
      case "cancelled":
      case "refunded":
        return "bg-destructive/10 text-destructive border-destructive/10";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <Link
        href="/account/orders"
        className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1.5">
          <H2 className="font-heading text-3xl font-bold">Order Details</H2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-primary select-all">
              #{orderDetails.id.toUpperCase()}
            </span>
            <span className="text-muted-foreground text-xs">
              • Placed on {formattedPlacedDate}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:self-start">
          <Badge
            variant="outline"
            className={`rounded-full py-1 px-3 text-[10px] uppercase font-bold tracking-widest ${getStatusBadgeClass(orderDetails.status)}`}
          >
            {orderDetails.status.replace("_", " ")}
          </Badge>
          {orderDetails.fulfillmentMethod === "delivery" ? (
            <Badge
              variant="outline"
              className="border-indigo-100/50 bg-indigo-500/5 text-indigo-600 rounded-full text-[10px] font-bold uppercase py-1 px-3 tracking-widest"
            >
              Delivery
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-100/50 bg-amber-500/5 text-amber-600 rounded-full text-[10px] font-bold uppercase py-1 px-3 tracking-widest"
            >
              Collection
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main receipt details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card */}
          <Card className="border border-border/40 bg-card/40">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-md flex items-center gap-2">
                <ShoppingCart className="h-4.5 w-4.5 text-primary" />
                Itemized Bakes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {orderDetails.items.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground italic">
                  Bespoke custom bake order — see confectionery notes for
                  customization descriptions.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {orderDetails.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex justify-between items-center text-sm gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground">
                          {item.productName}
                        </span>
                        {item.variantName && (
                          <span className="text-xs text-muted-foreground block">
                            Option: {item.variantName}
                          </span>
                        )}
                        {item.sku && (
                          <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-muted-foreground block">
                          £{parseFloat(item.unitPrice).toFixed(2)} ×{" "}
                          {item.quantity}
                        </span>
                        <span className="font-semibold text-foreground block mt-0.5">
                          £{parseFloat(item.lineTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost Summary rows */}
              <div className="border-t border-border/60 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>£{parseFloat(orderDetails.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground border-t border-border/40 pt-2 mt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    £{parseFloat(orderDetails.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Bespoke Notes */}
          {orderDetails.note && (
            <Card className="border border-border/40 bg-card/40">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="font-heading text-md flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                  Confectionery Details & Custom Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-light">
                  {orderDetails.note}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fulfillment schedule & contact column */}
        <div className="space-y-6">
          {/* Schedule and fulfillment details */}
          <Card className="border border-border/40 bg-card/40">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-md">
                Fulfillment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-xs text-muted-foreground">
              {/* Date */}
              {formattedFulfillmentDate && (
                <div className="space-y-1">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">
                    Scheduled Date
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span>{formattedFulfillmentDate}</span>
                  </div>
                </div>
              )}

              {/* Time Slot */}
              {orderDetails.fulfillmentTimeSlot && (
                <div className="space-y-1">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">
                    Fulfillment Slot
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>{orderDetails.fulfillmentTimeSlot}</span>
                  </div>
                </div>
              )}

              {/* Location/Address */}
              <div className="space-y-1.5 border-t border-border/40 pt-4">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">
                  Fulfillment Location
                </span>
                {orderDetails.fulfillmentMethod === "delivery" &&
                orderDetails.deliveryAddress ? (
                  <div className="flex gap-2 text-sm text-muted-foreground font-light">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-xs">
                        {orderDetails.name}
                      </p>
                      <p>{orderDetails.deliveryAddress.line1}</p>
                      {orderDetails.deliveryAddress.line2 && (
                        <p>{orderDetails.deliveryAddress.line2}</p>
                      )}
                      <p>
                        {orderDetails.deliveryAddress.city},{" "}
                        {orderDetails.deliveryAddress.postalCode}
                      </p>
                    </div>
                  </div>
                ) : orderDetails.fulfillmentMethod === "collection" ? (
                  <div className="flex gap-2 text-sm text-muted-foreground font-light">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-foreground">
                        Salisbury Bakery collection point
                      </p>
                      <p>Salisbury, Wiltshire, UK</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Please bring your order ID confirmation or show this
                        digital receipt when picking up your bakes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="italic text-muted-foreground/50">
                    Address details missing
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer contact details */}
          <Card className="border border-border/40 bg-card/40">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="font-heading text-md">
                Buyer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground truncate">
                  {orderDetails.email}
                </span>
              </div>
              {orderDetails.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">{orderDetails.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
