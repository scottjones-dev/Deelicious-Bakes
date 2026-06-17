import { eq, or } from "drizzle-orm";
import { ArrowRight, Calendar, Eye, ShoppingBag } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { H2, P } from "@/components/ui/typography";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Find customer record associated with logged-in user (match userId OR email)
  const customerRecord = await db.query.customers.findFirst({
    where: or(
      eq(customers.userId, session.user.id),
      eq(customers.email, session.user.email),
    ),
  });

  let userOrders: any[] = [];
  if (customerRecord) {
    userOrders = await db.query.orders.findMany({
      where: eq(orders.customerId, customerRecord.id),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/10";
      case "paid":
        return "bg-blue-500/10 text-blue-600 border-blue-500/10";
      case "processing":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/10";
      case "ready_for_collection":
        return "bg-amber-500/10 text-amber-600 border-amber-500/10";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/10";
      case "cancelled":
      case "refunded":
        return "bg-destructive/10 text-destructive border-destructive/10";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <H2 className="font-heading">Order History</H2>
        <P className="text-muted-foreground">
          Keep track of your current and past bakes.
        </P>
      </div>

      {userOrders.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/10 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Looks like you haven't ordered any treats yet. Once you do, they
                will appear here!
              </p>
            </div>
            <Link
              href="/"
              className="mt-2 text-sm text-primary hover:underline font-medium"
            >
              Browse the Menu
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userOrders.map((ord) => {
            const formattedPlacedDate = new Date(
              ord.createdAt,
            ).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const formattedFulfillmentDate = ord.fulfillmentDate
              ? new Date(ord.fulfillmentDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <Card
                key={ord.id}
                className="border-border/40 shadow-sm bg-card/40 overflow-hidden hover:border-primary/20 transition-all"
              >
                <div className="p-6 sm:flex sm:items-center sm:justify-between gap-6">
                  {/* Left detail stack */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-primary">
                        #{ord.id.substring(0, 8).toUpperCase()}
                      </span>
                      <Badge
                        variant="outline"
                        className={`rounded-full py-0.5 px-2.5 text-[10px] uppercase font-bold tracking-wider ${getStatusBadgeClass(ord.status)}`}
                      >
                        {ord.status.replace("_", " ")}
                      </Badge>
                      {ord.fulfillmentMethod === "delivery" ? (
                        <Badge
                          variant="outline"
                          className="border-indigo-100/50 bg-indigo-500/5 text-indigo-600 rounded-full text-[10px] font-semibold uppercase py-0.5 px-2"
                        >
                          Delivery
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-100/50 bg-amber-500/5 text-amber-600 rounded-full text-[10px] font-semibold uppercase py-0.5 px-2"
                        >
                          Collection
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-2 grid-cols-2 text-xs text-muted-foreground pt-1">
                      <div>
                        <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] block mb-0.5">
                          Date Placed
                        </span>
                        <span>{formattedPlacedDate}</span>
                      </div>
                      {formattedFulfillmentDate && (
                        <div>
                          <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] block mb-0.5">
                            Target Date
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{formattedFulfillmentDate}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right actions stack */}
                  <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/40 shrink-0">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        £{parseFloat(ord.total).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="cursor-pointer h-9 px-4 rounded-lg"
                    >
                      <Link
                        href={`/account/orders/${ord.id}`}
                        className="flex items-center gap-1.5"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
