import { H1, P } from "@/components/ui/typography";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full space-y-4 text-center border-2 border-primary/20 p-8 rounded-2xl bg-card">
        <H1 className="text-primary">Admin Portal</H1>
        <P className="text-muted-foreground">
          Restricted access. This area is only for bakery staff to manage products and orders.
        </P>
      </div>
    </div>
  );
}
