"use client";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  PlusCircle,
  Save,
  Trash2,
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
import {
  type AvailableBundleVariant,
  BundleCompositionEditor,
  type BundleDraftItem,
  type BundlePricingMode,
} from "../bundle-composition-editor";
import { type RecipeDraft, RecipeEditor } from "../recipe-editor";

interface CreateProductFormProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  availableVariants: Array<{
    id: string;
    name: string;
    price: string;
    product: {
      id: string;
      name: string;
    } | null;
  }>;
  ingredients: Array<{
    id: string;
    name: string;
    baseUnit: "g" | "ml";
    costPerBaseUnit: string;
  }>;
}

export function CreateProductForm({
  categories,
  availableVariants,
  ingredients,
}: CreateProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Interactive Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [dietaryInfo, setDietaryInfo] = useState("");
  const [ingredientsInfo, setIngredientsInfo] = useState("");
  const [sizesAndServes, setSizesAndServes] = useState("");
  const [shelfLifeStorage, setShelfLifeStorage] = useState("");
  const [arrivalInfo, setArrivalInfo] = useState("");
  const [deliveryOptions, setDeliveryOptions] = useState("");
  const [variants, setVariants] = useState([
    {
      name: "Pack of 1",
      sku: "",
      price: "4.99",
      compareAtPrice: "",
    },
  ]);
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [isCollectionOnly, setIsCollectionOnly] = useState(false);
  const [productType, setProductType] = useState("standard");
  const [status, setStatus] = useState("draft");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [images, setImages] = useState<Array<{ url: string; key: string }>>([]);
  const [bundlePricingMode, setBundlePricingMode] =
    useState<BundlePricingMode>("fixed_price");
  const [bundlePricingValue, setBundlePricingValue] = useState("0.00");
  const [bundleItems, setBundleItems] = useState<BundleDraftItem[]>([
    { productVariantId: "", quantity: 1 },
  ]);
  const [recipe, setRecipe] = useState<RecipeDraft>({
    sourceUrl: "",
    sourceName: "",
    instructions: "",
    yieldQuantity: "1",
    yieldUnit: "batch",
    lines: [{ ingredientId: "", quantity: "0", unit: "g", notes: "" }],
  });

  const selectableBundleVariants: AvailableBundleVariant[] =
    availableVariants.map((variant) => ({
      id: variant.id,
      productName: variant.product?.name ?? "Unknown product",
      variantName: variant.name,
      price: variant.price,
    }));

  const applyImportedRecipeDetails = (imported: {
    sourceUrl: string;
    sourceName: string;
    instructions: string;
    yieldQuantity: number;
    yieldUnit: string;
    lines: Array<{
      ingredientId: string | null;
      quantity: number;
      unit: "g" | "kg" | "ml" | "l";
      notes: string | null;
    }>;
    createdIngredients: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }) => {
    const importedNotes = imported.lines
      .map((line) => line.notes?.trim() || "")
      .filter(Boolean)
      .join("\n");
    const resolvedTitle =
      imported.sourceName.trim() ||
      imported.instructions.trim().split("\n")[0] ||
      "Imported product";
    const resolvedSku = `PROD-${resolvedTitle
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;

    setTitle((prev) => (prev.trim() ? prev : resolvedTitle));
    setSku((prev) => (prev.trim() ? prev : resolvedSku));
    setDescription((prev) =>
      prev.trim()
        ? prev
        : imported.sourceName.trim() ||
          imported.instructions.trim() ||
          "Imported product",
    );
    setDietaryInfo(
      (prev) =>
        prev.trim() || "Imported recipe - review allergens before publishing.",
    );
    setIngredientsInfo((prev) => prev.trim() || importedNotes);
    setSizesAndServes((prev) =>
      prev.trim()
        ? prev
        : `Yield: ${imported.yieldQuantity} ${imported.yieldUnit}`,
    );
    setShelfLifeStorage(
      (prev) => prev.trim() || "Use the imported recipe guidance for storage.",
    );
    setArrivalInfo((prev) => prev.trim() || "Packed for safe bakery transit.");
    setDeliveryOptions(
      (prev) => prev.trim() || "Standard delivery options apply.",
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a product title before saving.");
      return;
    }

    if (
      variants.length === 0 ||
      variants.some(
        (variant) =>
          !variant.name.trim() ||
          !variant.price.trim() ||
          Number.isNaN(Number(variant.price)) ||
          Number(variant.price) < 0,
      )
    ) {
      toast.error(
        "Please add at least one valid variant with a name and positive price.",
      );
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    startTransition(async () => {
      const normalizedBundleItems = bundleItems
        .map((item, index) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          position: index,
        }))
        .filter((item) => item.productVariantId.trim().length > 0);

      if (productType === "bundle") {
        if (normalizedBundleItems.length === 0) {
          toast.error("Bundle products require at least one included variant.");
          return;
        }

        const uniqueVariantIds = new Set(
          normalizedBundleItems.map((item) => item.productVariantId),
        );
        if (uniqueVariantIds.size !== normalizedBundleItems.length) {
          toast.error("Each bundle item must use a different variant.");
          return;
        }

        const numericPricing = Number(bundlePricingValue);
        if (
          Number.isNaN(numericPricing) ||
          numericPricing < 0 ||
          (bundlePricingMode === "percentage_discount" && numericPricing > 100)
        ) {
          toast.error("Please enter a valid bundle pricing value.");
          return;
        }
      }

      const bundleCompositionPayload =
        productType === "bundle"
          ? {
              pricingMode: bundlePricingMode,
              fixedPrice:
                bundlePricingMode === "fixed_price"
                  ? Number.parseFloat(bundlePricingValue).toFixed(2)
                  : undefined,
              percentageDiscount:
                bundlePricingMode === "percentage_discount"
                  ? Number.parseFloat(bundlePricingValue).toFixed(2)
                  : undefined,
              items: normalizedBundleItems,
            }
          : undefined;

      const normalizedVariants = variants.map((variant, index) => ({
        name: variant.name.trim(),
        sku:
          variant.sku.trim() ||
          `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-v${index + 1}`,
        price: Number.parseFloat(variant.price).toFixed(2),
        compareAtPrice: variant.compareAtPrice.trim() || undefined,
      }));

      const normalizedRecipeLines = recipe.lines
        .filter(
          (line) =>
            line.ingredientId.trim().length > 0 &&
            Number.isFinite(Number.parseFloat(line.quantity)) &&
            Number.parseFloat(line.quantity) > 0,
        )
        .map((line, index) => ({
          ingredientId: line.ingredientId,
          quantity: Number.parseFloat(line.quantity),
          unit: line.unit,
          notes: line.notes.trim() || undefined,
          position: index,
        }));

      const recipePayload = {
        sourceUrl: recipe.sourceUrl.trim() || undefined,
        sourceName: recipe.sourceName.trim() || undefined,
        instructions: recipe.instructions.trim() || undefined,
        yieldQuantity: Math.max(
          Number.parseFloat(recipe.yieldQuantity) || 1,
          1,
        ),
        yieldUnit: recipe.yieldUnit.trim() || "batch",
        lines: normalizedRecipeLines,
      };

      const importedNotes = normalizedRecipeLines
        .map((line) => line.notes?.trim() || "")
        .filter(Boolean)
        .join("\n");
      const resolvedTitle =
        title.trim() ||
        recipe.sourceName.trim() ||
        recipe.instructions.trim().split("\n")[0] ||
        "Imported product";
      const resolvedSku =
        sku.trim() ||
        `PROD-${resolvedTitle
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}`;
      const resolvedDescription =
        description.trim() ||
        recipe.sourceName.trim() ||
        recipe.instructions.trim().split("\n")[0] ||
        "Imported product";
      const resolvedDietaryInfo =
        dietaryInfo.trim() ||
        "Imported recipe - review allergens before publishing.";
      const resolvedIngredientsInfo =
        ingredientsInfo.trim() ||
        importedNotes ||
        "Imported recipe ingredients.";
      const resolvedSizesAndServes =
        sizesAndServes.trim() ||
        `Yield: ${Math.max(Number.parseFloat(recipe.yieldQuantity) || 1, 1)} ${recipe.yieldUnit.trim() || "batch"}`;
      const resolvedShelfLifeStorage =
        shelfLifeStorage.trim() ||
        "Use the imported recipe guidance for storage.";
      const resolvedArrivalInfo =
        arrivalInfo.trim() || "Packed for safe bakery transit.";
      const resolvedDeliveryOptions =
        deliveryOptions.trim() || "Standard delivery options apply.";

      const res = await createProduct(
        {
          name: resolvedTitle,
          slug: resolvedTitle
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-"),
          description: resolvedDescription || undefined,
          sku: resolvedSku || undefined,
          dietaryInfo: resolvedDietaryInfo || undefined,
          ingredientsInfo: resolvedIngredientsInfo || undefined,
          sizesAndServes: resolvedSizesAndServes || undefined,
          shelfLifeStorage: resolvedShelfLifeStorage || undefined,
          arrivalInfo: resolvedArrivalInfo || undefined,
          deliveryOptions: resolvedDeliveryOptions || undefined,
          categoryId,
          productType: productType as "standard" | "bundle",
          status: status as "active" | "draft" | "archived",
          images,
          leadTimeDays,
          isCollectionOnly,
          recipe: recipePayload,
        },
        normalizedVariants,
        [], // No tags linked during initial draft
        bundleCompositionPayload,
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
                  htmlFor="product-sku"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product SKU (Optional)
                </label>
                <Input
                  id="product-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. CCUCT6"
                  disabled={isPending}
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

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Product Detail Sections
              </CardTitle>
              <CardDescription className="text-xs">
                Information blocks shown on the product page under the main
                description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="product-dietary-info"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Dietary, Allergy and Safety Information
                </label>
                <textarea
                  id="product-dietary-info"
                  value={dietaryInfo}
                  onChange={(e) => setDietaryInfo(e.target.value)}
                  rows={3}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-ingredients-info"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Ingredients
                </label>
                <textarea
                  id="product-ingredients-info"
                  value={ingredientsInfo}
                  onChange={(e) => setIngredientsInfo(e.target.value)}
                  rows={4}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-sizes-serves"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Sizes and Serves
                </label>
                <textarea
                  id="product-sizes-serves"
                  value={sizesAndServes}
                  onChange={(e) => setSizesAndServes(e.target.value)}
                  rows={3}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-shelf-life"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Shelf Life & Storage
                </label>
                <textarea
                  id="product-shelf-life"
                  value={shelfLifeStorage}
                  onChange={(e) => setShelfLifeStorage(e.target.value)}
                  rows={3}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-arrival-info"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  How your cake arrives
                </label>
                <textarea
                  id="product-arrival-info"
                  value={arrivalInfo}
                  onChange={(e) => setArrivalInfo(e.target.value)}
                  rows={3}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="product-delivery-options"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Delivery Options
                </label>
                <textarea
                  id="product-delivery-options"
                  value={deliveryOptions}
                  onChange={(e) => setDeliveryOptions(e.target.value)}
                  rows={6}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Product Variants
              </CardTitle>
              <CardDescription className="text-xs">
                Define purchasable variants like pack sizes and their pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={`${variant.name}-${index}`}
                  className="grid gap-3 rounded-lg border border-border/60 p-4 md:grid-cols-4"
                >
                  <div className="grid gap-1">
                    <label
                      htmlFor={`variant-name-${index}`}
                      className="text-xs font-bold text-foreground uppercase tracking-wider"
                    >
                      Variant Name
                    </label>
                    <Input
                      id={`variant-name-${index}`}
                      value={variant.name}
                      disabled={isPending}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, name: e.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label
                      htmlFor={`variant-price-${index}`}
                      className="text-xs font-bold text-foreground uppercase tracking-wider"
                    >
                      Price (£)
                    </label>
                    <Input
                      id={`variant-price-${index}`}
                      type="number"
                      step="0.01"
                      min="0.00"
                      value={variant.price}
                      disabled={isPending}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, price: e.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label
                      htmlFor={`variant-sku-${index}`}
                      className="text-xs font-bold text-foreground uppercase tracking-wider"
                    >
                      SKU (Optional)
                    </label>
                    <Input
                      id={`variant-sku-${index}`}
                      value={variant.sku}
                      disabled={isPending}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, sku: e.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label
                      htmlFor={`variant-compare-${index}`}
                      className="text-xs font-bold text-foreground uppercase tracking-wider"
                    >
                      Compare At (£)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`variant-compare-${index}`}
                        type="number"
                        step="0.01"
                        min="0.00"
                        value={variant.compareAtPrice}
                        disabled={isPending}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, compareAtPrice: e.target.value }
                                : entry,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={isPending || variants.length === 1}
                        onClick={() =>
                          setVariants((prev) =>
                            prev.filter(
                              (_, variantIndex) => variantIndex !== index,
                            ),
                          )
                        }
                        className="shrink-0"
                        title="Remove variant"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="flex items-center gap-2"
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    {
                      name: `Pack of ${prev.length + 1}`,
                      sku: "",
                      price: "0.00",
                      compareAtPrice: "",
                    },
                  ])
                }
              >
                <PlusCircle className="size-4" />
                <span>Add Variant</span>
              </Button>
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

          <BundleCompositionEditor
            visible={productType === "bundle"}
            isPending={isPending}
            availableVariants={selectableBundleVariants}
            pricingMode={bundlePricingMode}
            pricingValue={bundlePricingValue}
            items={bundleItems}
            onPricingModeChange={setBundlePricingMode}
            onPricingValueChange={setBundlePricingValue}
            onItemsChange={setBundleItems}
          />

          <RecipeEditor
            isPending={isPending}
            ingredients={ingredients}
            recipe={recipe}
            onChange={setRecipe}
            onImported={applyImportedRecipeDetails}
          />

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
                  htmlFor="product-type"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product Type
                </label>
                <select
                  id="product-type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="standard">Standard Product</option>
                  <option value="bundle">Selection Box Bundle</option>
                </select>
              </div>

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
