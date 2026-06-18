import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchaseCard } from "@/components/cart/product-purchase-card";
import { Shell } from "@/components/shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { normalizeLobbyImageUrl } from "@/lib/image";

const categoryFallbacks: Record<string, string> = {
  cupcakes:
    "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600",
  "celebration-cakes":
    "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600",
  "brownies-traybakes":
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600",
  macarons:
    "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=600",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.slug, slug), eq(table.status, "active")),
    with: {
      category: {
        columns: {
          name: true,
          slug: true,
          image: true,
        },
      },
      variants: {
        where: (table, { eq }) => eq(table.disabled, false),
        columns: {
          id: true,
          name: true,
          price: true,
          position: true,
        },
        orderBy: (table, { asc }) => [asc(table.position)],
      },
    },
  });

  if (!product || product.variants.length === 0) {
    notFound();
  }

  const primaryImage =
    product.images?.[0]?.url ??
    normalizeLobbyImageUrl(product.category?.image) ??
    (product.category?.slug
      ? (categoryFallbacks[product.category.slug] ?? null)
      : null);
  const detailSections = [
    {
      key: "dietary-info",
      title: "Dietary, Allergy and Safety Information",
      content: product.dietaryInfo,
    },
    {
      key: "ingredients-info",
      title: "Ingredients",
      content: product.ingredientsInfo,
    },
    {
      key: "sizes-serves",
      title: "Sizes and Serves",
      content: product.sizesAndServes,
    },
    {
      key: "shelf-life-storage",
      title: "Shelf Life & Storage",
      content: product.shelfLifeStorage,
    },
    {
      key: "arrival-info",
      title: "How your cake arrives",
      content: product.arrivalInfo,
    },
    {
      key: "delivery-options",
      title: "DELIVERY OPTIONS",
      content: product.deliveryOptions,
    },
  ].filter((section) => Boolean(section.content?.trim()));

  return (
    <Shell className="max-w-6xl space-y-10 px-6 py-12">
      <Link
        href={`/store/${product.category?.slug ?? "all"}`}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to {product.category?.name ?? "Store"}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full text-xs">
              {product.category?.name ?? "Gourmet Bake"}
            </Badge>
            <H1 className="font-heading text-3xl md:text-4xl">
              {product.name}
            </H1>
            <P className="text-muted-foreground">
              {product.description || "Freshly handcrafted to order."}
            </P>
            <p className="text-sm text-muted-foreground">
              Lead time: {product.leadTimeDays} day
              {product.leadTimeDays === 1 ? "" : "s"}
              {product.isCollectionOnly ? " · Collection only" : ""}
            </p>
          </div>

          <ProductPurchaseCard
            productId={product.id}
            variants={product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              price: Number(variant.price),
            }))}
          />
        </div>
      </div>

      <section className="space-y-6 rounded-2xl border border-border/50 bg-card/30 p-6 md:p-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {product.description || "Freshly handcrafted to order."}
          </p>
          {product.sku ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">SKU:</span>{" "}
              {product.sku}
            </p>
          ) : null}
        </div>

        {detailSections.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {detailSections.map((section) => (
              <AccordionItem key={section.key} value={section.key}>
                <AccordionTrigger>{section.title}</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {section.content}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}
      </section>
    </Shell>
  );
}
