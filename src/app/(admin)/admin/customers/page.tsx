import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { CustomersTable } from "./customers-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  // Fetch customers
  const allCustomers = await db.query.customers.findMany({
    orderBy: (customers) => [customers.createdAt],
  });

  return (
    <div className="space-y-6 p-8 flex-1">
      {/* Header */}
      <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <H1 className="font-heading text-3xl font-bold">
            Customers Directory
          </H1>
          <P className="text-muted-foreground text-sm mt-1">
            Browse registered clients, check communication consent, and
            synchronize customer data with Stripe and Resend.
          </P>
        </div>
      </div>

      {/* Interactive client side table with manual sync */}
      <CustomersTable initialCustomers={allCustomers} />
    </div>
  );
}
