import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/account/sidebar-nav";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { appendAuthCallback } from "@/lib/auth-redirect";

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

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(appendAuthCallback("/sign-in", "/account"));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <Shell className="px-4 py-12 md:px-6 lg:py-16">
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-4xl">{children}</div>
          </div>
        </Shell>
      </main>
    </div>
  );
}
