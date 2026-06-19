type BundleDisplayItem = {
  quantity: number;
  variant: {
    name: string;
    price: string;
    product: {
      name: string;
    } | null;
  } | null;
};

type BundleDisplaySource = {
  pricingMode: "fixed_price" | "percentage_discount";
  fixedPrice: string | null;
  percentageDiscount: string | null;
  items: BundleDisplayItem[];
} | null;

function toNumber(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getBundlePricingSummary(bundle: BundleDisplaySource) {
  if (!bundle) {
    return null;
  }

  const basePrice = bundle.items.reduce((total, item) => {
    const itemPrice = toNumber(item.variant?.price);
    return total + itemPrice * item.quantity;
  }, 0);

  if (bundle.pricingMode === "fixed_price") {
    const finalPrice = toNumber(bundle.fixedPrice);
    return {
      basePrice,
      finalPrice,
      savings: Math.max(basePrice - finalPrice, 0),
    };
  }

  const discount = toNumber(bundle.percentageDiscount);
  const finalPrice = Math.max(basePrice * (1 - discount / 100), 0);
  return {
    basePrice,
    finalPrice,
    savings: Math.max(basePrice - finalPrice, 0),
  };
}

export function getBundleCompositionText(
  items: BundleDisplayItem[],
  maxItems = 3,
) {
  const visibleItems = items.slice(0, maxItems).map((item) => {
    const itemName = item.variant?.name ?? "Selected item";
    return `${item.quantity}× ${itemName}`;
  });

  if (visibleItems.length === 0) {
    return "Bundle composition selected at checkout.";
  }

  const remaining = items.length - visibleItems.length;
  if (remaining > 0) {
    return `${visibleItems.join(", ")} + ${remaining} more`;
  }

  return visibleItems.join(", ");
}
