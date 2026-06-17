import { count, eq } from "drizzle-orm";
import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  // Fetch categories
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories) => [categories.name],
  });

  // Attach product counts to each category
  const categoryStats = await Promise.all(
    allCategories.map(async (cat) => {
      const [productCountResult] = await db
        .select({ value: count() })
        .from(products)
        .where(eq(products.categoryId, cat.id));

      return {
        ...cat,
        productCount: productCountResult?.value ?? 0,
      };
    }),
  );

  return (
    <div className="space-y-6 p-8 flex-1">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <H1 className="font-heading text-3xl font-bold">Product Categories</H1>
        <P className="text-muted-foreground text-sm mt-1">
          Manage product groupings to structure your Salisbury bakery catalog.
          Delete categories safely with automatic fallback reassignment.
        </P>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Creator Form (Client side) */}
        <div className="lg:col-span-1">
          <CategoryForm />
        </div>

        {/* Categories List Table (Client side) */}
        <div className="lg:col-span-2">
          <CategoryList initialCategories={categoryStats} />
        </div>
      </div>
    </div>
  );
}
