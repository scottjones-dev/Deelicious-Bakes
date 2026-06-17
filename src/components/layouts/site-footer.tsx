import Link from "next/link";

import { siteConfig } from "@/config/site";
import { JoinNewsletterForm } from "@/components/marketing/join-newsletter-form";
import { ModeToggle } from "@/components/layouts/mode-toggle";

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-6 py-12 md:py-16 space-y-12">
        <section className="flex flex-col gap-10 lg:flex-row lg:gap-20">
          <section className="space-y-4">
            <Link href="/" className="flex w-fit items-center space-x-2">
              <span className="font-signature text-3xl font-normal text-primary hover:text-primary/90 transition-colors">
                {siteConfig.name}
              </span>
              <span className="sr-only">Home</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Bespoke celebration cakes, fresh cupcakes, and confectionery bakes
              handcrafted in Salisbury.
            </p>
          </section>

          <section className="grid flex-1 grid-cols-2 md:grid-cols-4 gap-8">
            {siteConfig.footerNav.map((item) => (
              <div key={item.title} className="space-y-3">
                <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  {item.title}
                </h4>
                <ul className="space-y-2.5">
                  {item.items.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        target={link?.external ? "_blank" : undefined}
                        rel={link?.external ? "noreferrer" : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.title}
                        <span className="sr-only">{link.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="space-y-3 min-w-60">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Subscribe to our newsletter
            </h4>
            <JoinNewsletterForm />
          </section>
        </section>

        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-8">
          <div className="text-left text-sm text-muted-foreground">
            Built by{" "}
            <Link
              href="https://alicesystems.co.uk"
              target="_blank"
              rel="noreferrer"
              className="font-semibold transition-colors hover:text-primary"
            >
              Alice Systems
            </Link>
            . &copy; {new Date().getFullYear()} Deelicious Bakes. All rights
            reserved.
          </div>
          <div className="flex items-center space-x-1">
            <ModeToggle />
          </div>
        </section>
      </div>
    </footer>
  );
}
