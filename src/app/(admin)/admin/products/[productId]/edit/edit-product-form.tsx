"use client";

import { ArrowLeft, Loader2, PlusCircle, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProduct } from "@/app/actions/product";
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
import type { Product, ProductVariant } from "@/db/schema";
import type { StoredFile } from "@/types";
import {
  type AvailableBundleVariant,
  BundleCompositionEditor,
  type BundleDraftItem,
  type BundlePricingMode,
} from "../../bundle-composition-editor";
import { type RecipeDraft, RecipeEditor } from "../../recipe-editor";

interface EditProductFormProps {
  product: Product;
  variants: ProductVariant[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  bundle: {
    id: string;
    pricingMode: "fixed_price" | "percentage_discount";
    fixedPrice: string | null;
    percentageDiscount: string | null;
    items: Array<{
      productVariantId: string;
      quantity: number;
      position: number;
    }>;
  } | null;
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
  recipe: {
    sourceUrl: string | null;
    sourceName: string | null;
    instructions: string | null;
    yieldQuantity: string;
    yieldUnit: string;
    ingredients: Array<{
      ingredientId: string;
      quantity: string;
      unit: "g" | "kg" | "ml" | "l";
      notes: string | null;
      position: number;
    }>;
  } | null;
}

type EditableVariant = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
};

export function EditProductForm({
  product,
  variants,
  categories,
  bundle,
  availableVariants,
  ingredients,
  recipe,
}: EditProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [sku, setSku] = useState(product.sku ?? "");
  const [dietaryInfo, setDietaryInfo] = useState(product.dietaryInfo ?? "");
  const [ingredientsInfo, setIngredientsInfo] = useState(
    product.ingredientsInfo ?? "",
  );
  const [sizesAndServes, setSizesAndServes] = useState(
    product.sizesAndServes ?? "",
  );
  const [shelfLifeStorage, setShelfLifeStorage] = useState(
    product.shelfLifeStorage ?? "",
  );
  const [arrivalInfo, setArrivalInfo] = useState(product.arrivalInfo ?? "");
  const [deliveryOptions, setDeliveryOptions] = useState(
    product.deliveryOptions ?? "",
  );
  const [leadTimeDays, setLeadTimeDays] = useState(product.leadTimeDays);
  const [isCollectionOnly, setIsCollectionOnly] = useState(
    product.isCollectionOnly,
  );
  const [productType, setProductType] = useState(product.productType);
  const [status, setStatus] = useState(product.status);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [images, setImages] = useState<StoredFile[]>(product.images ?? []);
  const [variantRows, setVariantRows] = useState<EditableVariant[]>(
    variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku ?? "",
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? "",
    })),
  );
  const [bundlePricingMode, setBundlePricingMode] = useState<BundlePricingMode>(
    bundle?.pricingMode ?? "fixed_price",
  );
  const [bundlePricingValue, setBundlePricingValue] = useState(
    bundle?.pricingMode === "fixed_price"
      ? (bundle.fixedPrice ?? "0.00")
      : (bundle?.percentageDiscount ?? "0.00"),
  );
  const [bundleItems, setBundleItems] = useState<BundleDraftItem[]>(
    bundle?.items.length
      ? bundle.items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        }))
      : [{ productVariantId: "", quantity: 1 }],
  );
  const [recipeDraft, setRecipeDraft] = useState<RecipeDraft>({
    sourceUrl: recipe?.sourceUrl ?? "",
    sourceName: recipe?.sourceName ?? "",
    instructions: recipe?.instructions ?? "",
    yieldQuantity: recipe?.yieldQuantity ?? "1",
    yieldUnit: recipe?.yieldUnit ?? "batch",
    lines: recipe?.ingredients.length
      ? recipe.ingredients.map((line) => ({
          ingredientId: line.ingredientId,
          quantity: line.quantity,
          unit: line.unit,
          notes: line.notes ?? "",
        }))
      : [{ ingredientId: "", quantity: "0", unit: "g", notes: "" }],
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

  const hasValidVariants = useMemo(
    () =>
      variantRows.length > 0 &&
      variantRows.every(
        (variant) =>
          variant.name.trim().length > 0 &&
          variant.price.trim().length > 0 &&
          !Number.isNaN(Number(variant.price)) &&
          Number(variant.price) >= 0,
      ),
    [variantRows],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a product title.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!hasValidVariants) {
      toast.error("Please provide valid variants before saving.");
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

      const payloadVariants = variantRows.map((variant, index) => ({
        id: variant.id,
        name: variant.name.trim(),
        sku:
          variant.sku.trim() ||
          `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-v${index + 1}`,
        price: Number.parseFloat(variant.price).toFixed(2),
        compareAtPrice: variant.compareAtPrice.trim() || undefined,
      }));

      const normalizedRecipeLines = recipeDraft.lines
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

      const importedNotes = normalizedRecipeLines
        .map((line) => line.notes?.trim() || "")
        .filter(Boolean)
        .join("\n");
      const resolvedTitle =
        title.trim() ||
        recipeDraft.sourceName.trim() ||
        recipeDraft.instructions.trim().split("\n")[0] ||
        "Imported product";
      const resolvedSku =
        sku.trim() ||
        `PROD-${resolvedTitle
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}`;
      const resolvedDescription =
        description.trim() ||
        recipeDraft.sourceName.trim() ||
        recipeDraft.instructions.trim().split("\n")[0] ||
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
        `Yield: ${Math.max(Number.parseFloat(recipeDraft.yieldQuantity) || 1, 1)} ${recipeDraft.yieldUnit.trim() || "batch"}`;
      const resolvedShelfLifeStorage =
        shelfLifeStorage.trim() ||
        "Use the imported recipe guidance for storage.";
      const resolvedArrivalInfo =
        arrivalInfo.trim() || "Packed for safe bakery transit.";
      const resolvedDeliveryOptions =
        deliveryOptions.trim() || "Standard delivery options apply.";

      const result = await updateProduct(
        product.id,
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
          productType,
          status,
          images,
          leadTimeDays,
          isCollectionOnly,
          recipe: {
            sourceUrl: recipeDraft.sourceUrl.trim() || undefined,
            sourceName: recipeDraft.sourceName.trim() || undefined,
            instructions: recipeDraft.instructions.trim() || undefined,
            yieldQuantity: Math.max(
              Number.parseFloat(recipeDraft.yieldQuantity) || 1,
              1,
            ),
            yieldUnit: recipeDraft.yieldUnit.trim() || "batch",
            lines: normalizedRecipeLines,
          },
        },
        payloadVariants,
        [],
        bundleCompositionPayload,
      );

      if (result.success) {
        toast.success(`Updated "${title}" successfully.`);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update product.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div>
        <H1 className="font-heading text-3xl font-bold">Edit Product</H1>
        <P className="text-muted-foreground text-sm mt-1">
          Update product details, variants, and publishing status.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Product Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-title"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product Title
                </label>
                <Input
                  id="edit-product-title"
                  value={title}
                  disabled={isPending}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-sku"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product SKU (Optional)
                </label>
                <Input
                  id="edit-product-sku"
                  value={sku}
                  disabled={isPending}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-description"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Description
                </label>
                <textarea
                  id="edit-product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isPending}
                  rows={4}
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
                These sections render on the storefront product page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-dietary-info"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Dietary, Allergy and Safety Information
                </label>
                <textarea
                  id="edit-product-dietary-info"
                  value={dietaryInfo}
                  onChange={(e) => setDietaryInfo(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-ingredients-info"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Ingredients
                </label>
                <textarea
                  id="edit-product-ingredients-info"
                  value={ingredientsInfo}
                  onChange={(e) => setIngredientsInfo(e.target.value)}
                  disabled={isPending}
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-sizes-serves"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Sizes and Serves
                </label>
                <textarea
                  id="edit-product-sizes-serves"
                  value={sizesAndServes}
                  onChange={(e) => setSizesAndServes(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-shelf-life"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Shelf Life & Storage
                </label>
                <textarea
                  id="edit-product-shelf-life"
                  value={shelfLifeStorage}
                  onChange={(e) => setShelfLifeStorage(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-arrival-info"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  How your cake arrives
                </label>
                <textarea
                  id="edit-product-arrival-info"
                  value={arrivalInfo}
                  onChange={(e) => setArrivalInfo(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-product-delivery-options"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Delivery Options
                </label>
                <textarea
                  id="edit-product-delivery-options"
                  value={deliveryOptions}
                  onChange={(e) => setDeliveryOptions(e.target.value)}
                  disabled={isPending}
                  rows={6}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Product Variants
              </CardTitle>
              <CardDescription className="text-xs">
                Configure sellable packs/sizes and individual pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variantRows.map((variant, index) => (
                <div
                  key={`${variant.id ?? "new"}-${index}`}
                  className="grid gap-3 rounded-lg border border-border/60 p-4 md:grid-cols-4"
                >
                  <div className="grid gap-1">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Variant Name
                    </label>
                    <Input
                      value={variant.name}
                      disabled={isPending}
                      onChange={(e) =>
                        setVariantRows((prev) =>
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
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Price (£)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.00"
                      value={variant.price}
                      disabled={isPending}
                      onChange={(e) =>
                        setVariantRows((prev) =>
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
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      SKU (Optional)
                    </label>
                    <Input
                      value={variant.sku}
                      disabled={isPending}
                      onChange={(e) =>
                        setVariantRows((prev) =>
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
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Compare At (£)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.00"
                        value={variant.compareAtPrice}
                        disabled={isPending}
                        onChange={(e) =>
                          setVariantRows((prev) =>
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
                        disabled={isPending || variantRows.length === 1}
                        onClick={() =>
                          setVariantRows((prev) =>
                            prev.filter(
                              (_, variantIndex) => variantIndex !== index,
                            ),
                          )
                        }
                        className="shrink-0"
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
                  setVariantRows((prev) => [
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

          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminProductPhotoManager
                onImagesChanged={(uploadedImages) =>
                  setImages((prev) => [
                    ...prev,
                    ...uploadedImages.map((image) => ({
                      id: image.key,
                      name: image.key,
                      key: image.key,
                      url: image.url,
                      size: 0,
                    })),
                  ])
                }
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
            recipe={recipeDraft}
            onChange={setRecipeDraft}
            onImported={applyImportedRecipeDetails}
          />
        </div>

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
                  htmlFor="edit-product-type"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product Type
                </label>
                <select
                  id="edit-product-type"
                  value={productType}
                  onChange={(e) =>
                    setProductType(e.target.value as "standard" | "bundle")
                  }
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="standard">Standard Product</option>
                  <option value="bundle">Selection Box Bundle</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="edit-status"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Publishing Status
                </label>
                <select
                  id="edit-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "active" | "draft" | "archived")
                  }
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
                  htmlFor="edit-category"
                  className="text-xs font-bold text-foreground uppercase tracking-wider"
                >
                  Product Category
                </label>
                <select
                  id="edit-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-lead-time"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Lead Time (Days)
                  </label>
                  <Input
                    id="edit-lead-time"
                    type="number"
                    min="0"
                    value={leadTimeDays}
                    disabled={isPending}
                    onChange={(e) =>
                      setLeadTimeDays(Number.parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-collection-only"
                    className="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Collection Only
                  </label>
                  <div className="flex h-10 items-center gap-2">
                    <input
                      id="edit-collection-only"
                      type="checkbox"
                      checked={isCollectionOnly}
                      onChange={(e) => setIsCollectionOnly(e.target.checked)}
                      disabled={isPending}
                      className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full cursor-pointer flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
