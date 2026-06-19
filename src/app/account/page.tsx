import { eq, or } from "drizzle-orm";
import { Settings, ShoppingBag, UserCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, P, Signature } from "@/components/ui/typography";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { appendAuthCallback } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export default async function AccountDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <P>Please sign in to view your account.</P>
        <Link
          href={appendAuthCallback("/sign-in", "/account")}
          className="text-primary hover:underline"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const customerRecord = await db.query.customers.findFirst({
    where: or(
      eq(customers.userId, session.user.id),
      eq(customers.email, session.user.email),
    ),
    with: {
      orders: {
        columns: {
          id: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });

  const orderCount = customerRecord?.orders.length ?? 0;
  const activeOrders =
    customerRecord?.orders.filter((order) =>
      ["pending", "paid", "processing", "ready_for_collection"].includes(
        order.status,
      ),
    ).length ?? 0;
  const latestOrder = customerRecord?.orders.reduce<Date | null>(
    (latest, order) => {
      if (!latest || order.createdAt > latest) {
        return order.createdAt;
      }
      return latest;
    },
    null,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <Signature className="text-4xl text-primary">Welcome back,</Signature>
        <H2 className="font-heading">{session.user.name}</H2>
        <P className="text-muted-foreground">
          Manage your orders and account preferences below.
        </P>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/account/orders">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
              <p className="text-xs text-muted-foreground">
                {orderCount === 0
                  ? "No orders yet"
                  : `${activeOrders} active ${activeOrders === 1 ? "order" : "orders"}`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/account/settings">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Manage profile and marketing
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full bg-muted/20 border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <UserCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xs font-medium uppercase tracking-widest text-primary">
              {session.user.role || "Customer"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {latestOrder
                ? `Latest order ${latestOrder.toLocaleDateString("en-GB")}`
                : "Start exploring to place your first order"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
