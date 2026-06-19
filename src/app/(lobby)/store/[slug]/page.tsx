import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import {
  getBundleCompositionText,
  getBundlePricingSummary,
} from "@/lib/bundle-pricing";
import { getProductImage } from "@/lib/image";
import { formatPrice } from "@/lib/utils";

export default async function StoreCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const selectedCategory =
    slug === "all"
      ? {
          id: "",
          name: "All Bakes",
          slug: "all",
          description: "Explore every active bake in our catalog.",
          image: null,
        }
      : await db.query.categories.findFirst({
          where: (table, { eq }) => eq(table.slug, slug),
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
          },
        });

  if (!selectedCategory) {
    notFound();
  }

  const products = await db.query.products.findMany({
    where: (table, { and, eq }) =>
      slug === "all"
        ? eq(table.status, "active")
        : and(
            eq(table.status, "active"),
            eq(table.categoryId, selectedCategory.id),
          ),
    with: {
      category: {
        columns: {
          name: true,
          slug: true,
          image: true,
        },
      },
      variants: {
        columns: {
          id: true,
          name: true,
          price: true,
        },
        where: (table, { eq }) => eq(table.disabled, false),
        orderBy: (table, { asc }) => [asc(table.position)],
      },
      bundle: {
        columns: {
          pricingMode: true,
          fixedPrice: true,
          percentageDiscount: true,
        },
        with: {
          items: {
            columns: {
              quantity: true,
              position: true,
            },
            orderBy: (table, { asc }) => [asc(table.position)],
            with: {
              variant: {
                columns: {
                  name: true,
                  price: true,
                },
                with: {
                  product: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return (
    <Shell className="max-w-6xl space-y-8 px-6 py-12">
      <div className="space-y-2">
        <H1 className="font-heading text-3xl md:text-4xl">
          {selectedCategory.name}
        </H1>
        <P className="text-muted-foreground">
          {selectedCategory.description ||
            "Browse our handcrafted bakery range."}
        </P>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No active products are available in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const primaryVariant = product.variants[0];
            const imageUrl = getProductImage(product);
            const bundlePricing = getBundlePricingSummary(product.bundle);
            const bundleComposition = product.bundle
              ? getBundleCompositionText(product.bundle.items)
              : null;
            const displayPrice =
              bundlePricing?.finalPrice ??
              (primaryVariant ? Number(primaryVariant.price) : null);
            const savingsText =
              bundlePricing && bundlePricing.savings > 0
                ? `Save ${formatPrice(bundlePricing.savings)}`
                : null;

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 shadow-sm"
              >
                <div className="relative aspect-square bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {product.bundle
                        ? "Selection Box"
                        : product.category?.name || "Gourmet"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {product.leadTimeDays}d lead
                    </span>
                  </div>

                  <h2 className="line-clamp-1 text-lg font-semibold">
                    <Link
                      href={`/store/products/${product.slug}`}
                      className="hover:text-primary"
                    >
                      {product.name}
                    </Link>
                  </h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description || "Freshly handcrafted to order."}
                  </p>
                  {bundleComposition ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      Includes: {bundleComposition}
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {displayPrice !== null
                        ? formatPrice(displayPrice)
                        : "Price on request"}
                    </p>
                    {savingsText ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        {savingsText}
                      </span>
                    ) : null}
                    {primaryVariant ? (
                      <AddToCartButton
                        productId={product.id}
                        productVariantId={primaryVariant.id}
                      />
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/store/products/${product.slug}`}>
                          View product
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
