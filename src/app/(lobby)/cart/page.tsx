import { CartPageContent } from "@/components/cart/cart-page-content";
import { Shell } from "@/components/shell";
import { H1, P } from "@/components/ui/typography";

export default function CartPage() {
  return (
    <Shell className="max-w-5xl space-y-8 px-6 py-12">
      <div className="space-y-2">
        <H1 className="font-heading text-3xl md:text-4xl">Your cart</H1>
        <P className="text-muted-foreground">
          Review your selected bakes. Checkout will be added next.
        </P>
      </div>
      <CartPageContent />
    </Shell>
  );
}
