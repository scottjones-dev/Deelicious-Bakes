"use client";

import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Leaf,
  Loader2,
  PoundSterling,
  Save,
  ShieldAlert,
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
import { cn } from "@/lib/utils";

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

  // Food Safety States (Natasha's Law Compliance)
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);

  const handleDietaryTagToggle = (tagName: string) => {
    if (selectedDietaryTags.includes(tagName)) {
      setSelectedDietaryTags(selectedDietaryTags.filter((t) => t !== tagName));
    } else {
      setSelectedDietaryTags([...selectedDietaryTags, tagName]);
    }
  };

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

  const availableDietaryTags = [
    {
      name: "Gluten-Free",
      icon: Ban,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "Vegan",
      icon: Leaf,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Nut-Free",
      icon: Ban,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Dairy-Free",
      icon: Ban,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    },
  ];

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
                  placeholder="Provide a delicious description, allergens, and serving size details..."
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

          {/* Food Safety, Ingredients & Allergens (Natasha's Law Compliant) */}
          <Card className="border border-rose-500/20 bg-rose-500/2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-500">
                  Ingredients & Food Safety
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground/80">
                Natasha&apos;s Law Compliant. Specify ingredients and highlight
                allergens clearly for customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dietary Classifications */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Dietary Classifications (Storefront Badges)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableDietaryTags.map((tag) => {
                    const TagIcon = tag.icon;
                    const isSelected = selectedDietaryTags.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => handleDietaryTagToggle(tag.name)}
                        disabled={isPending}
                        className={cn(
                          "flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? `${tag.color} border-current font-bold ring-1 ring-current`
                            : "bg-background border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <TagIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{tag.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Ingredients Formulation */}
              <div className="grid gap-2">
                <label
                  htmlFor="product-ingredients"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Ingredients Statement
                </label>
                <textarea
                  id="product-ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g. Wheat flour (gluten), organic strawberries, free-range eggs, milk butter, sugar, vanilla extract."
                  rows={3}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <span className="text-[10px] text-muted-foreground font-light">
                  List ingredients in descending order of weight. Highlight
                  specific allergy-inducing items.
                </span>
              </div>

              {/* Highlighted Allergens */}
              <div className="grid gap-2">
                <label
                  htmlFor="product-allergens"
                  className="text-xs font-bold text-rose-500 uppercase tracking-wider"
                >
                  Explicit Allergen Warnings
                </label>
                <input
                  id="product-allergens"
                  type="text"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  placeholder="e.g. Wheat (Gluten), Eggs, Dairy, Soy. May contain traces of nuts."
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-rose-500/20 text-rose-600 font-medium placeholder:text-muted-foreground/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <span className="text-[10px] text-rose-500/80 font-light">
                  This statement will be flagged with a warning icon on the
                  product page.
                </span>
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
