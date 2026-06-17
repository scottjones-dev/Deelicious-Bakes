import { db } from "@/db";
import { CreateOrderForm } from "./create-order-form";

export const dynamic = "force-dynamic";

export default async function AdminNewOrderPage() {
  // Fetch existing customer profiles to choose from
  const allCustomers = await db.query.customers.findMany({
    orderBy: (customers) => [customers.createdAt],
  });

  return <CreateOrderForm customersList={allCustomers} />;
}
