import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, P } from "@/components/ui/typography";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import { auth } from "@/lib/auth";

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

const statusClass: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
  paid: "bg-blue-500/10 text-blue-600 border-blue-500/10",
  processing: "bg-indigo-500/10 text-indigo-600 border-indigo-500/10",
  ready_for_collection: "bg-amber-500/10 text-amber-600 border-amber-500/10",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/10",
  cancelled: "bg-destructive/10 text-destructive border-destructive/10",
  refunded: "bg-destructive/10 text-destructive border-destructive/10",
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const customerRecord = await db.query.customers.findFirst({
    where: eq(customers.userId, session.user.id),
  });

  const orderList = customerRecord
    ? await db.query.orders.findMany({
        where: (orders, { eq }) => eq(orders.customerId, customerRecord.id),
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        with: {
          items: true,
        },
      })
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <H2 className="font-heading">Order History</H2>
        <P className="text-muted-foreground">Keep track of your current and past bakes.</P>
      </div>

      {orderList.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/10 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Package className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Looks like you haven&apos;t ordered any treats yet. Once you do, they will appear here.
              </p>
            </div>
            <Link href="/" className="mt-2 text-sm text-primary hover:underline font-medium">
              Browse the Menu
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/10 bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading">Your Orders</CardTitle>
            <CardDescription>
              Open an order to see contact snapshots, totals, and fulfillment details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderList.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      Placed {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass[order.status] || "bg-muted text-muted-foreground border-border/50"}`}
                  >
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {order.fulfillmentMethod}
                    <span className="ml-2 text-xs">
                      • {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
