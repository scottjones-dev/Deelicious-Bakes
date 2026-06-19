import { and, eq, or } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, P } from "@/components/ui/typography";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { appendAuthCallback } from "@/lib/auth-redirect";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  ready_for_collection: "Ready for Collection",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(appendAuthCallback("/sign-in", `/account/orders/${orderId}`));
  }

  const customerRecord = await db.query.customers.findFirst({
    where: or(
      eq(customers.userId, session.user.id),
      eq(customers.email, session.user.email),
    ),
  });

  if (!customerRecord) {
    notFound();
  }

  const order = await db.query.orders.findFirst({
    where: (orders) =>
      and(eq(orders.id, orderId), eq(orders.customerId, customerRecord.id)),
    with: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link
        href="/account/orders"
        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="space-y-1">
        <H2 className="font-heading text-3xl">Order Details</H2>
        <P className="text-muted-foreground uppercase tracking-widest text-xs font-bold">
          Order ID: {order.id}
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-primary/10 bg-card/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No line items were captured for this order.
              </p>
            ) : (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {item.productName}
                      </p>
                      {item.variantName ? (
                        <p className="text-xs text-muted-foreground">
                          {item.variantName}
                        </p>
                      ) : null}
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Qty {item.quantity} × {formatPrice(item.unitPrice)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline">
                {statusLabel[order.status] || order.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fulfillment</span>
              <span className="capitalize">{order.fulfillmentMethod}</span>
            </div>
            {order.fulfillmentDate ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Target Date</span>
                <span>
                  {new Date(order.fulfillmentDate).toLocaleDateString("en-GB")}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
            <div className="border-t border-border/60 pt-3 space-y-1">
              <p className="text-muted-foreground">Contact Snapshot</p>
              <p className="font-medium">{order.name}</p>
              <p className="text-xs text-muted-foreground">{order.email}</p>
              {order.phone ? (
                <p className="text-xs text-muted-foreground">{order.phone}</p>
              ) : null}
            </div>
            {order.note ? (
              <div className="border-t border-border/60 pt-3 space-y-1">
                <p className="text-muted-foreground">Order Notes</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.note}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
