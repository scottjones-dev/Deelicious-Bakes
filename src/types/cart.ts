export interface CartSummaryItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartSummaryItem[];
  itemCount: number;
  subtotal: number;
}
