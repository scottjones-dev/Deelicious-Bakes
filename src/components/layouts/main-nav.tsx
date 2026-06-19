"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { MainNavItem } from "@/types";

interface MainNavProps {
  items?: MainNavItem[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="hidden gap-6 lg:flex items-center">
      <Link href="/" className="hidden items-center space-x-2 lg:flex">
        <span className="hidden font-signature text-3xl font-normal text-primary hover:text-primary/90 transition-colors lg:inline-block">
          {siteConfig.name}
        </span>
        <span className="sr-only">Home</span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {items?.map(
            (item) =>
              item.href && (
                <NavigationMenuItem key={item.title}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-auto bg-transparent",
                      )}
                    >
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ),
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
