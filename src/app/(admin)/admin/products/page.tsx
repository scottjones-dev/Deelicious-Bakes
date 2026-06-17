import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { ProductsTable } from "./products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Fetch products with their category relationships
  const allProducts = await db.query.products.findMany({
    with: {
      category: true,
    },
    orderBy: (products) => [products.createdAt],
  });

  return (
    <div className="space-y-6 p-8 flex-1">
      {/* Header */}
      <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <H1 className="font-heading text-3xl font-bold">Product Catalog</H1>
          <P className="text-muted-foreground text-sm mt-1">
            Manage your gourmet cakes, cookies, and sweet pastry offerings. Keep
            storefront items and pricing synced with Stripe.
          </P>
        </div>
      </div>

      {/* Interactive Products Directory Canvas */}
      <ProductsTable initialProducts={allProducts} />
    </div>
  );
}
