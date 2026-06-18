import { eq } from "drizzle-orm";
import {
  ArrowRight,
  Cake,
  Clock,
  Cookie,
  Heart,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { H1, Lead, P, Signature } from "@/components/ui/typography";
import { db } from "@/db";
import { products } from "@/db/schema";
import { normalizeLobbyImageUrl } from "@/lib/image";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const dbCategories = await db.query.categories.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
    },
  });

  const dbProducts = await db.query.products.findMany({
    limit: 4,
    where: eq(products.status, "active"),
    with: {
      category: true,
      variants: {
        columns: {
          id: true,
          name: true,
          price: true,
          position: true,
          disabled: true,
        },
        where: (table, { eq }) => eq(table.disabled, false),
        orderBy: (table, { asc }) => [asc(table.position)],
      },
    },
  });

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-125 h-125 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-100 h-100 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <section className="relative w-full py-16 md:py-28 border-b border-border/20 bg-linear-to-b from-primary/5 via-transparent to-transparent">
        <div className="container max-w-6xl mx-auto px-6 grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide border border-primary/20">
              <Sparkles className="size-3.5 animate-pulse" />
              Salisbury&apos;s Artisan Celebration Bakery
            </div>
            <div className="space-y-3">
              <Signature className="text-6xl md:text-8xl text-primary drop-shadow-sm select-none block">
                Deelicious Bakes
              </Signature>
              <H1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-foreground font-heading">
                Celebration Cakes & Gourmet Bakes
              </H1>
            </div>
            <Lead className="max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
              Meticulously handcrafted in Salisbury. We create spectacular
              bespoke celebration cakes, melt-in-the-mouth cupcakes, fudgy
              traybakes, and elegant macarons for your most treasured moments.
            </Lead>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all duration-300"
              >
                <Link
                  href="/build-a-cake"
                  className="inline-flex items-center gap-2"
                >
                  <Cake className="size-5" />
                  Design Your Cake
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto font-semibold border-border hover:bg-secondary/40 transition-all duration-300"
              >
                <Link
                  href="#categories"
                  className="inline-flex items-center gap-2"
                >
                  <ShoppingBag className="size-5" />
                  Explore Menu
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center relative select-none">
            <div className="absolute inset-0 bg-radial-gradient(circle,rgba(var(--primary),0.05)_0%,transparent_70%) blur-3xl pointer-events-none" />
            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-border/40 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image
                src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800"
                alt="Beautiful Layer Cake"
                fill
                sizes="(min-width: 1024px) 24rem, 20rem"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="w-full py-16 md:py-24 border-b border-border/20"
      >
        <div className="container max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground font-semibold">
              Browse Our Gourmet Collections
            </h2>
            <P className="text-muted-foreground">
              Select a collection to discover our fully customizable menus,
              bespoke sizing, and premium flavors.
            </P>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbCategories.map((category) => {
              const categoryImg =
                normalizeLobbyImageUrl(category.image) ||
                categoryFallbacks[category.slug] ||
                "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=400";
              return (
                <div
                  key={category.id}
                  className="group relative bg-card/30 border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <Image
                      src={categoryImg}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col grow space-y-2">
                    <h3 className="font-sans font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed grow">
                      {category.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full mt-2 group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground font-medium transition-colors"
                    >
                      <Link
                        href={`/store/${category.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 w-full"
                      >
                        View Products
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {dbProducts.length > 0 && (
        <section className="w-full py-16 md:py-24 border-b border-border/20 bg-secondary/10">
          <div className="container max-w-6xl mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="font-heading text-3xl md:text-4xl text-foreground font-semibold">
                  Artisan Favorites
                </h2>
                <P className="text-muted-foreground">
                  Our customers&apos; most-loved celebration bakes, fresh from
                  the ovens.
                </P>
              </div>
              <Button
                variant="outline"
                asChild
                className="self-center md:self-end border-primary/20 text-primary hover:bg-primary/5 font-semibold"
              >
                <Link
                  href="#categories"
                  className="inline-flex items-center gap-1.5"
                >
                  Browse All Products
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dbProducts.map((product) => {
                const primaryVariant = product.variants[0];
                let productImg =
                  "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=400";
                if (product.category?.image) {
                  productImg =
                    normalizeLobbyImageUrl(product.category.image) ||
                    productImg;
                } else if (product.category?.slug) {
                  productImg =
                    categoryFallbacks[product.category.slug] || productImg;
                }

                return (
                  <div
                    key={product.id}
                    className="group relative bg-card/30 border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <Image
                        src={productImg}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex flex-col grow space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {product.category?.name || "Gourmet"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <Clock className="size-3 text-muted-foreground/75" />
                          {product.leadTimeDays}d lead
                        </span>
                      </div>
                      <h3 className="font-sans font-bold text-base text-foreground leading-snug line-clamp-1 grow">
                        <Link
                          href={`/store/products/${product.slug}`}
                          className="hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed grow">
                        {product.description}
                      </p>
                      {primaryVariant ? (
                        <AddToCartButton
                          productId={product.id}
                          productVariantId={primaryVariant.id}
                          variant="secondary"
                          size="sm"
                          className="w-full mt-2 font-semibold"
                        />
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                          className="w-full mt-2 font-semibold"
                        >
                          <Link href={`/store/products/${product.slug}`}>
                            View product
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto py-8">
        <div className="h-px bg-border/60 flex-1" />
        <Heart className="size-4 text-primary/70 fill-primary/10" />
        <div className="h-px bg-border/60 flex-1" />
      </div>

      <section className="w-full py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground font-semibold">
              Baked with Care in Salisbury
            </h2>
            <P className="text-muted-foreground">
              Discover what makes Deelicious Bakes Salisbury&apos;s premier
              bespoke bakery.
            </P>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-card/30 border border-border/50 rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-300 group">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                <Cookie className="size-7" />
              </div>
              <h3 className="font-sans text-xl font-bold mb-2 text-foreground">
                Artisan Quality & Freshness
              </h3>
              <P className="text-sm leading-relaxed">
                Everything is baked fresh to order in small batches. No
                artificial mixtures or shortcuts, just premium ingredients and
                pure passion.
              </P>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-card/30 border border-border/50 rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-300 group">
              <div className="size-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-5 group-hover:scale-110 transition-transform duration-300">
                <Cake className="size-7" />
              </div>
              <h3 className="font-sans text-xl font-bold mb-2 text-foreground">
                Custom Celebration Designs
              </h3>
              <P className="text-sm leading-relaxed">
                From luxury multi-tiered birthday cakes to bespoke corporate
                cupcake towers, we craft sweet showstoppers that perfectly
                reflect your vision.
              </P>
            </div>

            <div className="flex flex-col items-center text-center p-8 bg-card/30 border border-border/50 rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-300 group">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="size-7" />
              </div>
              <h3 className="font-sans text-xl font-bold mb-2 text-foreground">
                Salisbury Pickups & Consults
              </h3>
              <P className="text-sm leading-relaxed">
                Convenient pickup in Salisbury, Wiltshire. We also host direct
                consults for weddings, parties, and corporate custom orders.
              </P>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
