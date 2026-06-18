"use client";

import { Loader2, Settings, ShoppingBag, UserCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, P, Signature } from "@/components/ui/typography";
import { authClient } from "@/lib/auth-client";
import { appendAuthCallback } from "@/lib/auth-redirect";

export default function AccountDashboard() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Recent bakes and orders
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
              Verified Account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
