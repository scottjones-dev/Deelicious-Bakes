import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";

interface LobbyLayoutProps
  extends React.PropsWithChildren<{
    modal: React.ReactNode;
  }> {}

export default async function LobbyLayout({
  children,
  modal,
}: LobbyLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {children}
        {modal}
      </main>
      <SiteFooter />
    </div>
  );
}
