"use client";

import { Loader2, Plus, RefreshCw, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  syncOrdersWithStripeAction,
  updateOrderStatus,
} from "@/app/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: string;
  customerId: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "ready_for_collection"
    | "completed"
    | "cancelled"
    | "refunded";
  fulfillmentMethod: "delivery" | "collection";
  name: string;
  email: string;
  phone: string | null;
  total: string;
  createdAt: Date;
  customer?: {
    name: string | null;
    email: string;
  };
}

interface OrdersTableProps {
  initialOrders: OrderItem[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncOrdersWithStripeAction();

      if (res.success) {
        toast.success(res.message || "Stripe orders synced successfully! 🥐");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to sync orders with Stripe.");
      }
    });
  };

  const handleStatusChange = (
    orderId: string,
    name: string,
    status: string,
  ) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status as any);

      if (res.success) {
        toast.success(`Order status updated to "${status}" for ${name}!`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update order status.");
      }
    });
  };

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

  // Filter orders by ID, name, email
  const filteredOrders = initialOrders.filter((ord) => {
    const query = search.toLowerCase();
    const idMatch = ord.id.toLowerCase().includes(query);
    const nameMatch = ord.name.toLowerCase().includes(query);
    const emailMatch = ord.email.toLowerCase().includes(query);
    return idMatch || nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by order ID, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg bg-card/60"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isPending}
            className="cursor-pointer flex items-center gap-2 h-10 rounded-lg border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <RefreshCw className="size-4 text-primary" />
            )}
            <span>Sync Checkout Sessions</span>
          </Button>

          <Button asChild className="h-10 rounded-lg cursor-pointer">
            <Link
              href="/admin/orders/new"
              className="flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Create Order</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Orders Queue Card */}
      <Card className="border-border/40 shadow-sm bg-card/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <ShoppingCart className="size-4.5 text-primary" />
            Fulfillment Queue ({filteredOrders.length})
          </CardTitle>
          <CardDescription>
            Lists active sales, delivery methods, and payments. Status changes
            apply immediately to live pipelines.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <ShoppingCart className="size-6" />
              </div>
              <h4 className="font-bold text-foreground">No active orders</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No orders match your search query, or no customer purchases have
                been recorded in the database yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4 text-right">Date Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredOrders.map((ord) => {
                    const formattedDate = new Date(
                      ord.createdAt,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td
                          className="py-3.5 px-4 font-mono text-xs text-primary font-semibold select-all"
                          title={ord.id}
                        >
                          #{ord.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {ord.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ord.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.fulfillmentMethod === "delivery" ? (
                            <Badge
                              variant="outline"
                              className="border-indigo-200/50 bg-indigo-500/5 text-indigo-600 rounded-full font-semibold text-[10px] uppercase py-0.5 px-2 tracking-wide"
                            >
                              Delivery
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-200/50 bg-amber-500/5 text-amber-600 rounded-full font-semibold text-[10px] uppercase py-0.5 px-2 tracking-wide"
                            >
                              Collection
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground font-sans">
                          £{parseFloat(ord.total).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block w-40">
                            <select
                              value={ord.status}
                              disabled={isPending}
                              onChange={(e) =>
                                handleStatusChange(
                                  ord.id,
                                  ord.name,
                                  e.target.value,
                                )
                              }
                              className={`w-full h-8 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer transition-colors ${getStatusBadgeClass(
                                ord.status,
                              )}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="processing">Processing</option>
                              <option value="ready_for_collection">
                                Ready/Collect
                              </option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-muted-foreground">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
