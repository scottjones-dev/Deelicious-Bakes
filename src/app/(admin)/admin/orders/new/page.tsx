import { db } from "@/db";
import { NewOrderForm } from "./new-order-form";

export const dynamic = "force-dynamic";

export default async function AdminNewOrderPage() {
  const allCustomers = await db.query.customers.findMany({
    orderBy: (customers) => [customers.createdAt],
  });

  return (
    <NewOrderForm
      customers={allCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      }))}
    />
  );
}
