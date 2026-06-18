import { Clock3, Maximize2, PackageOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaceholderImage } from "@/components/placeholder-image";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { buttonVariants } from "@/components/ui/button";
import { DialogShell } from "@/components/ui/dialog-shell";
import { db } from "@/db";
import {
  getBundleCompositionText,
  getBundlePricingSummary,
} from "@/lib/bundle-pricing";
import { normalizeLobbyImageUrl } from "@/lib/image";
import { cn, formatPrice } from "@/lib/utils";

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

interface ProductModalPageProps {
  params: {
    productId: string;
  };
}

export default async function ProductModalPage({
  params,
}: ProductModalPageProps) {
  const productId = decodeURIComponent(params.productId);

  const product = await db.query.products.findFirst({
    where: (table, { eq }) => eq(table.id, productId),
    columns: {
      id: true,
      name: true,
      description: true,
      leadTimeDays: true,
      isCollectionOnly: true,
      productType: true,
    },
    with: {
      category: {
        columns: {
          image: true,
          name: true,
          slug: true,
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
  });

  if (!product) {
    notFound();
  }

  const primaryVariant = product.variants[0];
  const bundlePricing = getBundlePricingSummary(product.bundle);
  const bundleComposition = product.bundle
    ? getBundleCompositionText(product.bundle.items, 5)
    : null;
  const displayPrice =
    bundlePricing?.finalPrice ??
    (primaryVariant ? Number(primaryVariant.price) : null);
  const productImage =
    normalizeLobbyImageUrl(product.category?.image) ||
    (product.category?.slug ? categoryFallbacks[product.category.slug] : null);

  return (
    <DialogShell className="flex flex-col gap-2 overflow-visible sm:flex-row">
      <AlertDialogAction
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "icon",
            className:
              "absolute right-10 top-4 h-auto w-auto shrink-0 rounded-sm bg-transparent p-0 text-foreground opacity-70 ring-offset-background transition-opacity hover:bg-transparent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          }),
        )}
        asChild
      >
        <Link href={`/product/${product.id}`} replace>
          <Maximize2 className="size-4" aria-hidden="true" />
        </Link>
      </AlertDialogAction>
      <AspectRatio ratio={16 / 9} className="w-full">
        {productImage ? (
          <Image
            src={productImage}
            alt={product.name}
            className="object-cover"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
            fill
            loading="lazy"
          />
        ) : (
          <PlaceholderImage className="rounded-none" asChild />
        )}
      </AspectRatio>
      <div className="w-full space-y-6 p-6 sm:p-10">
        <div className="space-y-2">
          <h1 className="line-clamp-2 text-2xl font-bold">{product.name}</h1>
          <p className="text-base text-muted-foreground">
            {displayPrice !== null
              ? formatPrice(displayPrice)
              : "Price on request"}
          </p>
          {bundlePricing && bundlePricing.savings > 0 ? (
            <p className="text-sm font-semibold text-emerald-600">
              Save {formatPrice(bundlePricing.savings)} on this selection box
            </p>
          ) : null}
          {bundleComposition ? (
            <p className="text-xs text-muted-foreground">
              Includes: {bundleComposition}
            </p>
          ) : null}
          {product.category ? (
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <PackageOpen className="size-4" aria-hidden="true" />
              {primaryVariant ? primaryVariant.name : "Custom order"}
            </span>
            {product.productType === "bundle" ? (
              <span>Selection box bundle</span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {product.leadTimeDays > 0
                ? `${product.leadTimeDays} day lead time`
                : "Available to order"}
            </span>
            {product.isCollectionOnly ? <span>Collection only</span> : null}
          </div>
        </div>
        <p className="line-clamp-4 text-base text-muted-foreground">
          {product.description}
        </p>
      </div>
    </DialogShell>
  );
}
