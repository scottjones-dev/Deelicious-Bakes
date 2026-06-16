import { H2, P } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link href="/account/orders" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Orders
      </Link>

      <div className="space-y-1">
        <H2 className="font-heading text-3xl">Order Details</H2>
        <P className="text-muted-foreground uppercase tracking-widest text-xs font-bold">
          Order ID: {orderId}
        </P>
      </div>

      <Card className="border-primary/10 bg-card/50">
        <CardHeader>
          <CardTitle className="font-heading">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center text-muted-foreground">
          Detailed order information for <span className="text-primary">{orderId}</span> is loading...
        </CardContent>
      </Card>
    </div>
  );
}
