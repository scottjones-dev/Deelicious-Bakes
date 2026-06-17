"use client";

import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import type { MainNavItem } from "@/types";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileNavProps {
  items?: MainNavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const segment = useSelectedLayoutSegment();
  const [open, setOpen] = React.useState(false);

  if (isDesktop) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0 pt-9">
        <div className="w-full px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold text-lg">{siteConfig.name}</span>
            <span className="sr-only">Home</span>
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="pl-1 pr-7">
            <div className="flex flex-col space-y-4 pt-4">
              {items?.map((item, index) =>
                item.href ? (
                  <MobileLink
                    key={index}
                    href={String(item.href)}
                    segment={String(segment)}
                    setOpen={setOpen}
                    disabled={item.disabled}
                    className="text-base font-semibold"
                  >
                    {item.title}
                  </MobileLink>
                ) : (
                  <Accordion type="multiple" className="w-full" key={index}>
                    <AccordionItem value={item.title}>
                      <AccordionTrigger className="text-sm capitalize font-semibold">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2">
                          {item.items?.map((subItem, index) =>
                            subItem.href ? (
                              <MobileLink
                                key={index}
                                href={String(subItem.href)}
                                segment={String(segment)}
                                setOpen={setOpen}
                                disabled={subItem.disabled}
                                className="m-1"
                              >
                                {subItem.title}
                              </MobileLink>
                            ) : (
                              <div
                                key={index}
                                className="text-foreground/70 transition-colors"
                              >
                                {item.title}
                              </div>
                            ),
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ),
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  disabled?: boolean;
  segment: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function MobileLink({
  children,
  href,
  disabled,
  segment,
  setOpen,
  className,
  ...props
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground",
        href.includes(segment) && "text-foreground font-semibold",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </Link>
  );
}
