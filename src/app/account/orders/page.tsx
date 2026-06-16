import { H2, P } from "@/components/ui/typography";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <H2 className="font-heading">Order History</H2>
        <P className="text-muted-foreground">Keep track of your current and past bakes.</P>
      </div>

      <Card className="border-dashed border-2 border-primary/10 bg-transparent">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Looks like you haven't ordered any treats yet. Once you do, they will appear here!
            </p>
          </div>
          <a
            href="/"
            className="mt-2 text-sm text-primary hover:underline font-medium"
          >
            Browse the Menu
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
