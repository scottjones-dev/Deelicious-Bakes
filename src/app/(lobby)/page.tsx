import Image from "next/image";
import { H1, Lead, P, Signature } from "@/components/ui/typography";

export default function Home() {
  return (
    /* Uses dynamic --background theme tokens mapping seamlessly across light/dark states */
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans px-6 transition-colors duration-300">
      <main className="w-full max-w-4xl flex flex-col items-center text-center gap-10 py-24">

        {/* Brand mark */}
        <div className="flex flex-col items-center gap-4">
          <Signature className="text-6xl md:text-7xl text-primary">
            Deelicious Bakes
          </Signature>

          <P className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
            Homemade cakes • cookies • donuts • tray bakes
          </P>
        </div>

        {/* Hero */}
        <div className="flex flex-col gap-6 items-center">
          <H1 className="max-w-2xl text-foreground font-heading">
            Freshly baked at home, made with care, delivered locally
          </H1>

          <Lead className="max-w-xl text-muted-foreground">
            Custom cakes, cookies, brownies, and sweet treats baked fresh for birthdays,
            celebrations, and everyday cravings.
          </Lead>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a
            href="#order"
            className="flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground px-8 font-medium transition duration-200 hover:opacity-90 active:scale-[0.98] shadow-sm"
          >
            Order Now
          </a>

          <a
            href="#menu"
            className="flex h-12 items-center justify-center rounded-full border border-border bg-card text-foreground px-8 font-medium transition duration-200 hover:bg-muted active:scale-[0.98]"
          >
            View Menu
          </a>
        </div>

        {/* Image strip / product preview */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mt-6">
          {/* Swapped zinc classes for dynamic secondary/muted backgrounds to fit both modes */}
          <div className="aspect-square bg-secondary/60 border border-border/40 rounded-xl transition-colors" />
          <div className="aspect-square bg-secondary/60 border border-border/40 rounded-xl transition-colors" />
          <div className="aspect-square bg-secondary/60 border border-border/40 rounded-xl transition-colors" />
        </div>

        {/* Footer brand identity banner */}
        <div className="flex flex-col items-center gap-2 mt-8">
          <P className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Based in Salisbury • Pre-orders only • Fresh batches made daily
          </P>
          <P className="text-[10px] uppercase tracking-widest text-accent font-semibold">
            Fresh ingredients. Lots of love. Unforgettable flavours.
          </P>
        </div>

      </main>
    </div>
  );
}