import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // Fetch orders with customer relations
  const allOrders = await db.query.orders.findMany({
    with: {
      customer: true,
    },
    orderBy: (orders) => [orders.createdAt],
  });

  return (
    <div className="space-y-6 p-8 flex-1">
      {/* Header */}
      <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <H1 className="font-heading text-3xl font-bold">
            Orders Fulfillment
          </H1>
          <P className="text-muted-foreground text-sm mt-1">
            Monitor, update, and manage orders from preparation to final
            delivery or collection. Synchronize checkout transactions with
            Stripe.
          </P>
        </div>
      </div>

      {/* Interactive client side table with manual sync and status selectors */}
      <OrdersTable initialOrders={allOrders} />
    </div>
  );
}
