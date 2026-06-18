"use client";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  PoundSterling,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProduct } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { H1, P } from "@/components/ui/typography";
import { AdminProductPhotoManager } from "@/components/uploadthing/product-uploader";

interface CreateProductFormProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Interactive Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("4.99");
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [isCollectionOnly, setIsCollectionOnly] = useState(false);
  const [status, setStatus] = useState("draft");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [images, setImages] = useState<Array<{ url: string; key: string }>>([]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a product title before saving.");
      return;
    }

    if (!price.trim() || Number.isNaN(Number(price)) || Number(price) < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    startTransition(async () => {
      // Create a default Standard variant for pricing
      const defaultVariants = [
        {
          name: "Standard",
          price: parseFloat(price).toFixed(2),
          sku: `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-standard`,
        },
      ];

      const res = await createProduct(
        {
          name: title.trim(),
          slug: title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-"),
          description: description.trim() || undefined,
          categoryId,
          status: status as "active" | "draft" | "archived",
          images,
          leadTimeDays,
          isCollectionOnly,
        },
        defaultVariants,
        [], // No tags linked during initial draft
      );

      if (res.success) {
        toast.success(`Successfully saved "${title}" into store catalog! 🍰`);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save product.");
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Go Back Link */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Link href="/admin/products" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <H1 className="font-heading text-3xl font-bold">Create New Product</H1>
        <P className="text-muted-foreground text-sm mt-1">
          Add a brand-new gourmet cake, confection, or customized bake option to
          your active store catalog.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Product Identity
              </CardTitle>
              <CardDescription className="text-xs">
                Essential metadata that represents this creation across the
                customer storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="product-title"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product Title
                </label>
                <input
                  id="product-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Artisanal Velvet Strawberry Sponge Cake"
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-description"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Storefront Description
                </label>
                <textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a delicious description, flavour notes, serving size details..."
                  rows={4}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tier */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Pricing Tier
              </CardTitle>
              <CardDescription className="text-xs">
                Set the storefront retail price. This maps directly to a Price
                on Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-w-xs">
                <label
                  htmlFor="product-price"
                  className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1"
                >
                  <PoundSterling className="size-3.5" />
                  <span>Base Price (£)</span>
                </label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="4.99"
                  disabled={isPending}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Real Uploadthing Integration */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Confectionery Visuals
              </CardTitle>
              <CardDescription className="text-xs">
                Upload beautiful, high-resolution imagery of your bakes to
                entice buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProductPhotoManager
                onImagesChanged={(uploadedImages) => setImages(uploadedImages)}
              />
            </CardContent>
          </Card>

          {/* Delivery constraints */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Fulfillment & Constraints
              </CardTitle>
              <CardDescription className="text-xs">
                Time rules and collection parameters essential for bakery
                planning.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="lead-time"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Lead Time (Days)
                </label>
                <input
                  id="lead-time"
                  type="number"
                  min="0"
                  value={leadTimeDays}
                  onChange={(e) =>
                    setLeadTimeDays(parseInt(e.target.value, 10) || 0)
                  }
                  placeholder="3"
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground font-light">
                  Minimum notice needed to bake this item.
                </span>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="collection-only"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Fulfillment Limitations
                </label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    id="collection-only"
                    type="checkbox"
                    checked={isCollectionOnly}
                    onChange={(e) => setIsCollectionOnly(e.target.checked)}
                    disabled={isPending}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                  />
                  <label
                    htmlFor="collection-only"
                    className="text-xs text-muted-foreground font-medium cursor-pointer select-none"
                  >
                    Strictly Collection Only
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status and Actions sidebar */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Catalog Placement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="publish-status"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Publishing Status
                </label>
                <select
                  id="publish-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active / Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-category"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product Category
                </label>
                <select
                  id="product-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Bake...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Creation</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  asChild
                  disabled={isPending}
                  className="w-full cursor-pointer text-muted-foreground"
                >
                  <Link href="/admin/products">
                    <span>Cancel Changes</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/10 bg-amber-500/5">
            <CardContent className="pt-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                  Operations Guard
                </h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                  Images uploaded are stored immediately in UploadThing cloud
                  storage. Form submissions will write live products into your
                  workspace database and trigger a background Stripe sync.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
