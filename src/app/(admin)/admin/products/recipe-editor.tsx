"use client";

import { Loader2, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { importRecipeFromUrl } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  calculateRecipeLineCost,
  calculateRecipeTotals,
  calculateSuggestedPrice,
} from "@/lib/recipe-cost";
import { formatPrice } from "@/lib/utils";

export type RecipeDraftLine = {
  ingredientId: string;
  quantity: string;
  unit: "g" | "kg" | "ml" | "l";
  notes: string;
};

export type RecipeDraft = {
  sourceUrl: string;
  sourceName: string;
  instructions: string;
  yieldQuantity: string;
  yieldUnit: string;
  lines: RecipeDraftLine[];
};

interface RecipeEditorProps {
  isPending: boolean;
  ingredients: Array<{
    id: string;
    name: string;
    baseUnit: "g" | "ml";
    costPerBaseUnit: string;
  }>;
  recipe: RecipeDraft;
  onChange: (next: RecipeDraft) => void;
  onImported?: (data: {
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
  }) => void;
}

export function RecipeEditor({
  isPending,
  ingredients,
  recipe,
  onChange,
  onImported,
}: RecipeEditorProps) {
  const [isImporting, startImportTransition] = useTransition();
  const ingredientsById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const lineCostData = useMemo(
    () =>
      recipe.lines.map((line) => {
        const ingredient = ingredientsById.get(line.ingredientId);
        if (!ingredient) return { lineCost: 0 };
        return {
          lineCost: calculateRecipeLineCost({
            quantity: Number.parseFloat(line.quantity || "0"),
            unit: line.unit,
            baseUnit: ingredient.baseUnit,
            costPerBaseUnit: ingredient.costPerBaseUnit,
          }),
        };
      }),
    [recipe.lines, ingredientsById],
  );

  const totals = useMemo(
    () =>
      calculateRecipeTotals({
        lines: lineCostData,
        yieldQuantity: Number.parseFloat(recipe.yieldQuantity || "1"),
      }),
    [lineCostData, recipe.yieldQuantity],
  );

  const updateLine = (index: number, patch: Partial<RecipeDraftLine>) => {
    onChange({
      ...recipe,
      lines: recipe.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    });
  };

  const handleImport = () => {
    if (!recipe.sourceUrl.trim()) {
      toast.error("Enter a recipe URL first.");
      return;
    }

    startImportTransition(async () => {
      const result = await importRecipeFromUrl(recipe.sourceUrl.trim());
      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to import recipe.");
        return;
      }

      onChange({
        sourceUrl: result.data.sourceUrl ?? recipe.sourceUrl.trim(),
        sourceName: result.data.sourceName ?? recipe.sourceName,
        instructions: result.data.instructions ?? recipe.instructions,
        yieldQuantity: String(result.data.yieldQuantity ?? 1),
        yieldUnit: result.data.yieldUnit ?? (recipe.yieldUnit || "batch"),
        lines: result.data.lines
          .filter(
            (line): line is NonNullable<(typeof result.data.lines)[number]> =>
              line !== null,
          )
          .map((line) => ({
            ingredientId: line.ingredientId ?? "",
            quantity: String(line.quantity),
            unit: line.unit,
            notes: line.notes ?? "",
          })),
      });

      if (result.data.createdIngredients.length > 0) {
        toast.warning(
          `Imported ${result.data.createdIngredients.length} ingredient placeholder(s). Add prices in Ingredients.`,
        );
      } else {
        toast.success("Recipe imported successfully.");
      }

      onImported?.({
        sourceUrl: result.data.sourceUrl,
        sourceName: result.data.sourceName,
        instructions: result.data.instructions,
        yieldQuantity: result.data.yieldQuantity,
        yieldUnit: result.data.yieldUnit,
        lines: result.data.lines
          .filter(
            (line): line is NonNullable<(typeof result.data.lines)[number]> =>
              line !== null,
          )
          .map((line) => ({
            ingredientId: line.ingredientId ?? null,
            quantity: line.quantity,
            unit: line.unit,
            notes: line.notes ?? null,
          })),
        createdIngredients: result.data.createdIngredients,
      });
    });
  };

  return (
    <Card className="border border-border/60 bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Production Recipe
        </CardTitle>
        <CardDescription className="text-xs">
          Define method and ingredient quantities to calculate cost and
          suggested selling price (cost + 33%).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Recipe URL for import"
            value={recipe.sourceUrl}
            disabled={isPending || isImporting}
            onChange={(event) =>
              onChange({ ...recipe, sourceUrl: event.target.value })
            }
          />
          <Button
            type="button"
            variant="outline"
            disabled={isPending || isImporting}
            onClick={handleImport}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Import URL
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            placeholder="Recipe source name (optional)"
            value={recipe.sourceName}
            disabled={isPending}
            onChange={(event) =>
              onChange({ ...recipe, sourceName: event.target.value })
            }
          />
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <Input
              type="number"
              min="0.001"
              step="0.001"
              placeholder="Yield qty"
              value={recipe.yieldQuantity}
              disabled={isPending}
              onChange={(event) =>
                onChange({ ...recipe, yieldQuantity: event.target.value })
              }
            />
            <Input
              placeholder="Yield unit"
              value={recipe.yieldUnit}
              disabled={isPending}
              onChange={(event) =>
                onChange({ ...recipe, yieldUnit: event.target.value })
              }
            />
          </div>
        </div>

        <textarea
          value={recipe.instructions}
          onChange={(event) =>
            onChange({ ...recipe, instructions: event.target.value })
          }
          disabled={isPending}
          rows={5}
          placeholder="Method / instructions..."
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />

        <div className="space-y-3">
          {recipe.lines.map((line, index) => (
            <div
              key={`${line.ingredientId || "ingredient"}-${index}`}
              className="grid gap-2 rounded-lg border border-border/60 p-3 md:grid-cols-[1fr_110px_90px_auto]"
            >
              <select
                value={line.ingredientId}
                disabled={isPending}
                onChange={(event) =>
                  updateLine(index, { ingredientId: event.target.value })
                }
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select ingredient</option>
                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min="0.001"
                step="0.001"
                value={line.quantity}
                disabled={isPending}
                onChange={(event) =>
                  updateLine(index, { quantity: event.target.value })
                }
              />
              <select
                value={line.unit}
                disabled={isPending}
                onChange={(event) =>
                  updateLine(index, {
                    unit: event.target.value as "g" | "kg" | "ml" | "l",
                  })
                }
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
              </select>
              <Button
                type="button"
                variant="outline"
                disabled={isPending || recipe.lines.length === 1}
                onClick={() =>
                  onChange({
                    ...recipe,
                    lines: recipe.lines.filter(
                      (_, lineIndex) => lineIndex !== index,
                    ),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            onChange({
              ...recipe,
              lines: [
                ...recipe.lines,
                { ingredientId: "", quantity: "0", unit: "g", notes: "" },
              ],
            })
          }
        >
          <PlusCircle className="mr-2 size-4" />
          Add Ingredient Line
        </Button>

        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <p>Recipe cost: {formatPrice(totals.totalCost)}</p>
          <p>
            Cost per {recipe.yieldUnit || "unit"}:{" "}
            {formatPrice(totals.perUnitCost)}
          </p>
          <p>
            Suggested sell price (+33%): {formatPrice(totals.suggestedPrice)}
          </p>
          <p className="mt-1">
            Current suggested minimum for first variant:{" "}
            {formatPrice(calculateSuggestedPrice(totals.totalCost))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
