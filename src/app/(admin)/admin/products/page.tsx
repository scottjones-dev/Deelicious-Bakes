import { count } from "drizzle-orm";
import { Filter, Plus, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [productsCountResult] = await db
    .select({ value: count() })
    .from(products);
  const productsCount = productsCountResult?.value ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H1 className="font-heading">Product Catalog</H1>
          <P className="text-muted-foreground text-sm">
            Manage your gourmet cakes, cookies, and sweet pastry offerings.
          </P>
        </div>
        <Button asChild className="cursor-pointer">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Product</span>
          </Link>
        </Button>
      </div>

      {/* Catalog Control Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            disabled
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto ml-auto">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-xs shrink-0 cursor-not-allowed"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Product list canvas */}
      <Card className="border border-border/60 bg-card overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
            Product Catalog ({productsCount} registered)
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm font-light">
            No products are active in your storefront catalog currently, or they
            are in draft mode. Click above to list your first cake or bakery
            treat.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mt-6 cursor-pointer"
          >
            <Link
              href="/admin/products/new"
              className="flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Product</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
