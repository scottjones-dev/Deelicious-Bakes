"use client";

import {
  Archive,
  Cake,
  Edit3,
  EyeOff,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteProduct,
  syncProductToStripeAction,
} from "@/app/actions/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productType: "standard" | "bundle";
  status: "active" | "draft" | "archived";
  leadTimeDays: number;
  isCollectionOnly: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
}

interface ProductsTableProps {
  initialProducts: ProductItem[];
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const categoryFallbacks: Record<string, string> = {
    cupcakes:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600",
    "celebration-cakes":
      "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=600",
    "brownies-traybakes":
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600",
    macarons:
      "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=600",
  };

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSyncStripe = (id: string, name: string) => {
    setSyncingId(id);
    startTransition(async () => {
      const res = await syncProductToStripeAction(id);

      if (res.success) {
        toast.success(
          `Product "${name}" successfully queued for Stripe sync! 🏷️`,
        );
        router.refresh();
      } else {
        toast.error(res.error || "Stripe sync failed.");
      }
      setSyncingId(null);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (
      !window.confirm(
        `Archive "${name}"? This keeps the record in your catalog history and removes it from active selling.`,
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteProduct(id);

      if (res.success) {
        toast.success(
          res.message || `Product "${name}" archived successfully.`,
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to archive product.");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/10 rounded-full font-bold text-[10px] uppercase py-0.5 px-2 tracking-wide flex items-center gap-1 w-fit"
          >
            <Globe className="size-3" />
            <span>Active</span>
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 border-blue-500/10 rounded-full font-bold text-[10px] uppercase py-0.5 px-2 tracking-wide flex items-center gap-1 w-fit"
          >
            <EyeOff className="size-3" />
            <span>Draft</span>
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border rounded-full font-bold text-[10px] uppercase py-0.5 px-2 tracking-wide flex items-center gap-1 w-fit"
          >
            <span>Archived</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter products by search query
  const filteredProducts = initialProducts.filter((prod) => {
    const query = search.toLowerCase();
    const nameMatch = prod.name.toLowerCase().includes(query);
    const slugMatch = prod.slug.toLowerCase().includes(query);
    const catMatch = prod.category?.name.toLowerCase().includes(query) || false;
    return nameMatch || slugMatch || catMatch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg bg-card/60"
          />
        </div>

        <Button asChild className="h-10 rounded-lg cursor-pointer">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Create Product</span>
          </Link>
        </Button>
      </div>

      {/* Products Directory Grid/List Card */}
      <Card className="border-border/40 shadow-sm bg-card/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <ShoppingBag className="size-4.5 text-primary" />
            Product Catalog ({filteredProducts.length})
          </CardTitle>
          <CardDescription>
            Lists catalog items and current status. Click Sync to trigger Stripe
            Prices & pricing updates immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <ShoppingBag className="size-6" />
              </div>
              <h4 className="font-bold text-foreground">No products found</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No catalog items match your search, or there are no products
                listed in your database yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Lead Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredProducts.map((prod) => {
                    const imageUrl =
                      prod.category?.image ||
                      (prod.category?.slug
                        ? categoryFallbacks[prod.category.slug]
                        : null);
                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-border/30 overflow-hidden shrink-0">
                              {imageUrl ? (
                                <Image
                                  unoptimized
                                  src={imageUrl}
                                  alt={prod.name}
                                  width={40}
                                  height={40}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Cake className="size-5" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <Link
                                href={`/store/products/${prod.slug}`}
                                className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
                              >
                                {prod.name}
                              </Link>
                              <span
                                className="text-[10px] text-muted-foreground font-mono"
                                title={prod.id}
                              >
                                ID: {prod.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                          /{prod.slug}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="secondary"
                            className="rounded-full text-xs py-0.5 px-2 bg-muted/80 text-muted-foreground border border-border/40"
                          >
                            {prod.category?.name || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="outline"
                            className="rounded-full text-xs py-0.5 px-2"
                          >
                            {prod.productType === "bundle"
                              ? "Bundle"
                              : "Standard"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(prod.status)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-medium text-muted-foreground">
                          {prod.leadTimeDays}{" "}
                          {prod.leadTimeDays === 1 ? "day" : "days"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Sync to Stripe Button */}
                            <Button
                              variant="outline"
                              size="icon-sm"
                              disabled={isPending || syncingId === prod.id}
                              onClick={() =>
                                handleSyncStripe(prod.id, prod.name)
                              }
                              className="cursor-pointer size-8 rounded-lg border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shrink-0"
                              title="Sync Product & Prices to Stripe"
                            >
                              {syncingId === prod.id ? (
                                <Loader2 className="size-3.5 animate-spin text-primary" />
                              ) : (
                                <RefreshCw className="size-3.5 text-primary" />
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="icon-sm"
                              asChild
                              className="cursor-pointer size-8 rounded-lg border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shrink-0"
                              title="Edit Product"
                            >
                              <Link href={`/admin/products/${prod.id}/edit`}>
                                <Edit3 className="size-3.5 text-primary" />
                              </Link>
                            </Button>

                            {/* Archive Button */}
                            <Button
                              variant="outline"
                              size="icon-sm"
                              disabled={isPending || prod.status === "archived"}
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="cursor-pointer size-8 rounded-lg border-amber-500/30 hover:bg-amber-500/10 text-amber-600 focus:ring-amber-500/30 shrink-0"
                              title={
                                prod.status === "archived"
                                  ? "Already archived"
                                  : "Archive Product"
                              }
                            >
                              {isPending && syncingId !== prod.id ? (
                                <Loader2 className="size-3.5 animate-spin text-amber-600" />
                              ) : (
                                <Archive className="size-3.5 text-amber-600" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
