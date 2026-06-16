import { SidebarNav } from "@/components/account/sidebar-nav";
import { H2, P } from "@/components/ui/typography";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/account",
  },
  {
    title: "My Orders",
    href: "/account/orders",
  },
  {
    title: "Settings",
    href: "/account/settings",
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto flex-1 px-4 py-12 md:px-6 lg:py-16">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-4xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
