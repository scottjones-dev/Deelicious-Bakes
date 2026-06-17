import { headers } from "next/headers";
import { AuthDropdown } from "@/components/layouts/auth-dropdown";
import { MainNav } from "@/components/layouts/main-nav";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { ProductsCombobox } from "@/components/layouts/products-combobox";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import type { MainNavItem } from "@/types";

export async function SiteHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user ?? null;

  // Fetch categories dynamically from the database
  const categories = await db.query.categories.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  // Construct main navigation dynamically as single-level direct links
  const mainNav: MainNavItem[] = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Build a Cake",
      href: "/build-a-cake",
    },
    ...categories.map((category) => ({
      title: category.name,
      href: `/store/${category.slug}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <MainNav items={mainNav} />
        <MobileNav items={mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ProductsCombobox />
            {/* <CartSheet /> */}
            <AuthDropdown user={user} />
          </nav>
        </div>
      </div>
    </header>
  );
}
