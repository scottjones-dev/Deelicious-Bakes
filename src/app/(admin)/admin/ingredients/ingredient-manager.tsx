"use client";

import {
  CheckCircle2,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createIngredient,
  deleteIngredient,
  resolveIngredientQueue,
  updateIngredient,
} from "@/app/actions/ingredients";
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
import type { Ingredient } from "@/db/schema";
import { formatPrice } from "@/lib/utils";

type IngredientDraft = {
  id?: string;
  name: string;
  slug: string;
  baseUnit: "g" | "ml";
  purchaseUnit: "g" | "kg" | "ml" | "l";
  purchaseQuantity: string;
  purchasePrice: string;
  supplier: string;
};

function toDraft(ingredient?: Ingredient): IngredientDraft {
  if (!ingredient) {
    return {
      name: "",
      slug: "",
      baseUnit: "g",
      purchaseUnit: "kg",
      purchaseQuantity: "1",
      purchasePrice: "0.00",
      supplier: "",
    };
  }

  return {
    id: ingredient.id,
    name: ingredient.name,
    slug: ingredient.slug,
    baseUnit: ingredient.baseUnit,
    purchaseUnit: ingredient.purchaseUnit,
    purchaseQuantity: ingredient.purchaseQuantity,
    purchasePrice: ingredient.purchasePrice,
    supplier: ingredient.supplier ?? "",
  };
}

interface IngredientManagerProps {
  ingredients: Ingredient[];
}

export function IngredientManager({ ingredients }: IngredientManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<IngredientDraft>(() => toDraft());
  const [queueFilter, setQueueFilter] = useState<"all" | "queued" | "resolved">(
    "all",
  );
  const queueCount = ingredients.filter(
    (ingredient) => ingredient.queueStatus === "queued",
  ).length;
  const resolvedQueueCount = ingredients.filter(
    (ingredient) => ingredient.queueStatus === "resolved",
  ).length;
  const visibleIngredients =
    queueFilter === "queued"
      ? ingredients.filter((ingredient) => ingredient.queueStatus === "queued")
      : queueFilter === "resolved"
        ? ingredients.filter(
            (ingredient) => ingredient.queueStatus === "resolved",
          )
        : ingredients;

  const costPreview = useMemo(() => {
    const price = Number.parseFloat(draft.purchasePrice);
    const qty = Number.parseFloat(draft.purchaseQuantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0)
      return null;

    const multiplier =
      draft.baseUnit === "g"
        ? draft.purchaseUnit === "kg"
          ? 1000
          : draft.purchaseUnit === "g"
            ? 1
            : 0
        : draft.purchaseUnit === "l"
          ? 1000
          : draft.purchaseUnit === "ml"
            ? 1
            : 0;

    if (multiplier === 0) return null;
    return price / (qty * multiplier);
  }, [draft]);

  const handleSave = () => {
    const payload = {
      ...draft,
      purchaseQuantity: Number.parseFloat(draft.purchaseQuantity),
      purchasePrice: Number.parseFloat(draft.purchasePrice),
    };

    startTransition(async () => {
      const result = draft.id
        ? await updateIngredient(payload)
        : await createIngredient(payload);

      if (!result.success) {
        toast.error(result.error || "Failed to save ingredient.");
        return;
      }

      toast.success(
        draft.id ? "Ingredient updated successfully." : "Ingredient created.",
      );
      setDraft(toDraft());
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <H1 className="font-heading">Ingredient Costing</H1>
        <P className="text-muted-foreground text-sm">
          Maintain ingredient prices so recipe costs can be calculated from
          grams or millilitres.
        </P>
      </div>

      <Card className="border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Ingredient Entry
          </CardTitle>
          <CardDescription className="text-xs">
            Example: 15kg sugar bag price converts to cost per gram.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Ingredient name"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={isPending}
            />
            <Input
              placeholder="slug"
              value={draft.slug}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, slug: event.target.value }))
              }
              disabled={isPending}
            />
            <select
              value={draft.baseUnit}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  baseUnit: event.target.value as "g" | "ml",
                }))
              }
              className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              disabled={isPending}
            >
              <option value="g">Weight base (grams)</option>
              <option value="ml">Volume base (millilitres)</option>
            </select>
            <select
              value={draft.purchaseUnit}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  purchaseUnit: event.target.value as "g" | "kg" | "ml" | "l",
                }))
              }
              className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              disabled={isPending}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
            </select>
            <Input
              type="number"
              min="0.001"
              step="0.001"
              placeholder="Purchase quantity"
              value={draft.purchaseQuantity}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  purchaseQuantity: event.target.value,
                }))
              }
              disabled={isPending}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Purchase price (£)"
              value={draft.purchasePrice}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  purchasePrice: event.target.value,
                }))
              }
              disabled={isPending}
            />
            <Input
              placeholder="Supplier (optional)"
              value={draft.supplier}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, supplier: event.target.value }))
              }
              disabled={isPending}
              className="md:col-span-2"
            />
          </div>

          <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            {costPreview === null ? (
              <span>Enter valid values to preview cost per base unit.</span>
            ) : (
              <span>
                Estimated cost per {draft.baseUnit}: {formatPrice(costPreview)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isPending} type="button">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : draft.id ? (
                <>
                  <Pencil className="mr-2 size-4" />
                  Update Ingredient
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 size-4" />
                  Add Ingredient
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              disabled={isPending}
              onClick={() => setDraft(toDraft())}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Existing Ingredients
          </CardTitle>
          <CardDescription className="text-xs">
            {queueCount} unresolved import queue item
            {queueCount === 1 ? "" : "s"}.
            {resolvedQueueCount > 0
              ? ` ${resolvedQueueCount} resolved queue item${resolvedQueueCount === 1 ? "" : "s"} retained for history.`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={queueFilter === "all" ? "default" : "outline"}
              type="button"
              onClick={() => setQueueFilter("all")}
              disabled={isPending}
            >
              All Ingredients
            </Button>
            <Button
              size="sm"
              variant={queueFilter === "queued" ? "default" : "outline"}
              type="button"
              onClick={() => setQueueFilter("queued")}
              disabled={isPending}
            >
              Pricing Queue ({queueCount})
            </Button>
            <Button
              size="sm"
              variant={queueFilter === "resolved" ? "default" : "outline"}
              type="button"
              onClick={() => setQueueFilter("resolved")}
              disabled={isPending}
            >
              Queue Resolved ({resolvedQueueCount})
            </Button>
          </div>
          {visibleIngredients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {queueFilter === "queued"
                ? "No import placeholders are waiting for pricing."
                : queueFilter === "resolved"
                  ? "No queue items have been resolved yet."
                  : "No ingredients yet. Add your first one above."}
            </p>
          ) : (
            visibleIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {ingredient.name}
                    {ingredient.queueStatus === "queued" ? (
                      <span className="ml-2 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-600">
                        In queue
                      </span>
                    ) : null}
                    {ingredient.queueStatus === "resolved" ? (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-600">
                        Queue resolved
                      </span>
                    ) : null}
                    {ingredient.pricingStatus === "needs_pricing" ? (
                      <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-600">
                        Needs pricing
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ingredient.purchaseQuantity}
                    {ingredient.purchaseUnit} @{" "}
                    {formatPrice(ingredient.purchasePrice)} →{" "}
                    {formatPrice(ingredient.costPerBaseUnit)}/
                    {ingredient.baseUnit}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {ingredient.queueStatus === "queued" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={
                        isPending || ingredient.pricingStatus !== "priced"
                      }
                      onClick={() =>
                        startTransition(async () => {
                          const result = await resolveIngredientQueue(
                            ingredient.id,
                          );
                          if (!result.success) {
                            toast.error(
                              result.error || "Failed to resolve queue item.",
                            );
                            return;
                          }
                          toast.success("Queue item resolved.");
                          router.refresh();
                        })
                      }
                    >
                      <CheckCircle2 className="size-3.5" />
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={isPending}
                    onClick={() => setDraft(toDraft(ingredient))}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await deleteIngredient(ingredient.id);
                        if (!result.success) {
                          toast.error(result.error || "Failed to delete.");
                          return;
                        }
                        toast.success("Ingredient deleted.");
                        if (draft.id === ingredient.id) {
                          setDraft(toDraft());
                        }
                        router.refresh();
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
