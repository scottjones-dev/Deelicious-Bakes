import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <SidebarInset className="flex flex-col flex-1">
          {/* Top Bar Shell */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:px-6">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Operations Board
              </span>
            </div>
          </header>

          {/* Main Workspace */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
