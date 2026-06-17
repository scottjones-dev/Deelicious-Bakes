import { count } from "drizzle-orm";
import { Filter, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { H1, P } from "@/components/ui/typography";
import { db } from "@/db";
import { customers } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customersCountResult] = await db
    .select({ value: count() })
    .from(customers);
  const customersCount = customersCountResult?.value ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H1 className="font-heading">Customers Directory</H1>
          <P className="text-muted-foreground text-sm">
            Manage your customer database, billing addresses, and notification
            preferences.
          </P>
        </div>
        <Button asChild className="cursor-pointer">
          <Link
            href="/admin/customers/new"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Link>
        </Button>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers by name, email..."
            disabled
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto ml-auto">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-xs shrink-0 cursor-not-allowed"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Customer list canvas */}
      <Card className="border border-border/60 bg-card overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
            Registered Customers ({customersCount} entries)
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm font-light">
            No customers profiles are registered in your directory. Create a
            customer manually or let them sign up organically on your front
            page.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mt-6 cursor-pointer"
          >
            <Link
              href="/admin/customers/new"
              className="flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Profile</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
