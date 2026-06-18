type RecipeUnit = "g" | "kg" | "ml" | "l";
type BaseUnit = "g" | "ml";

const MARKUP_MULTIPLIER = 1.33;

function toNumber(value: number | string) {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(numeric) ? numeric : 0;
}

function roundTo(value: number, decimals: number) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function convertToBase(quantity: number, unit: RecipeUnit, baseUnit: BaseUnit) {
  if (baseUnit === "g") {
    if (unit === "g") return quantity;
    if (unit === "kg") return quantity * 1000;
    return 0;
  }

  if (unit === "ml") return quantity;
  if (unit === "l") return quantity * 1000;
  return 0;
}

export function normalizePurchaseQuantity(
  quantity: number | string,
  purchaseUnit: RecipeUnit,
  baseUnit: BaseUnit,
) {
  return convertToBase(toNumber(quantity), purchaseUnit, baseUnit);
}

export function calculateCostPerBaseUnit(
  purchasePrice: number | string,
  purchaseQuantity: number | string,
  purchaseUnit: RecipeUnit,
  baseUnit: BaseUnit,
) {
  const quantityInBase = normalizePurchaseQuantity(
    purchaseQuantity,
    purchaseUnit,
    baseUnit,
  );
  if (quantityInBase <= 0) return 0;
  return roundTo(toNumber(purchasePrice) / quantityInBase, 8);
}

export function calculateSuggestedPrice(totalCost: number | string) {
  return roundTo(toNumber(totalCost) * MARKUP_MULTIPLIER, 2);
}

export function calculateRecipeLineCost({
  quantity,
  unit,
  baseUnit,
  costPerBaseUnit,
}: {
  quantity: number | string;
  unit: RecipeUnit;
  baseUnit: BaseUnit;
  costPerBaseUnit: number | string;
}) {
  const quantityInBase = convertToBase(toNumber(quantity), unit, baseUnit);
  if (quantityInBase <= 0) return 0;
  return roundTo(quantityInBase * toNumber(costPerBaseUnit), 4);
}

export function calculateRecipeTotals({
  lines,
  yieldQuantity,
}: {
  lines: Array<{ lineCost: number | string }>;
  yieldQuantity: number | string;
}) {
  const totalCost = roundTo(
    lines.reduce((acc, line) => acc + toNumber(line.lineCost), 0),
    4,
  );
  const normalizedYield = Math.max(toNumber(yieldQuantity), 1);
  const perUnitCost = roundTo(totalCost / normalizedYield, 4);
  const suggestedPrice = calculateSuggestedPrice(totalCost);

  return {
    totalCost,
    perUnitCost,
    suggestedPrice,
  };
}
