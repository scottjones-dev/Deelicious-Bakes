"use client";

import { Loader2, Plus, RefreshCw, Search, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { syncCustomersAction } from "@/app/actions/admin";
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

interface CustomerItem {
  id: string;
  userId: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  stripeCustomerId: string | null;
  marketingConsent: boolean;
  createdAt: Date;
}

interface CustomersTableProps {
  initialCustomers: CustomerItem[];
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncCustomersAction();

      if (res.success) {
        toast.success(res.message || "Manual customer sync completed!");
        router.refresh();
      } else {
        toast.error(res.error || "Manual customer sync failed.");
      }
    });
  };

  // Client-side search filtering
  const filteredCustomers = initialCustomers.filter((cust) => {
    const query = search.toLowerCase();
    const nameMatch = cust.name?.toLowerCase().includes(query) || false;
    const emailMatch = cust.email.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name or email..."
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
            <span>Sync Stripe & Resend</span>
          </Button>

          <Button asChild className="h-10 rounded-lg cursor-pointer">
            <Link
              href="/admin/customers/new"
              className="flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Add Customer</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Customers List Card */}
      <Card className="border-border/40 shadow-sm bg-card/40">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Users className="size-4.5 text-primary" />
            Registered Profiles ({filteredCustomers.length})
          </CardTitle>
          <CardDescription>
            Lists customers who subscribed to waitlists or checked out. Use the
            manual sync keys to push changes immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Users className="size-6" />
              </div>
              <h4 className="font-bold text-foreground">No customer records</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No customer profiles match your search query, or no customers
                have registered in the database yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Stripe ID</th>
                    <th className="py-3 px-4 text-center">
                      Newsletter Consent
                    </th>
                    <th className="py-3 px-4 text-right">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredCustomers.map((cust) => {
                    const formattedDate = new Date(
                      cust.createdAt,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={cust.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {cust.name || "Bake Lover"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {cust.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground text-xs">
                          {cust.phone || (
                            <span className="text-muted-foreground/45 italic">
                              No phone
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                          {cust.stripeCustomerId ? (
                            <span className="text-primary hover:underline">
                              {cust.stripeCustomerId}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/35 italic">
                              Unlinked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {cust.marketingConsent ? (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/10 text-[10px] font-bold rounded-full py-0.5 px-2 uppercase tracking-wide"
                            >
                              Yes
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-muted text-muted-foreground border-border/50 text-[10px] font-bold rounded-full py-0.5 px-2 uppercase tracking-wide"
                            >
                              No
                            </Badge>
                          )}
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
