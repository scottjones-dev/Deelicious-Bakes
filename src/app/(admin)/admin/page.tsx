import { count, desc } from "drizzle-orm";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Package,
  PlusCircle,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, H2, P } from "@/components/ui/typography";
import { db } from "@/db";
import { customers, notifications, orders, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch system statistics in parallel
  const [productsResult, ordersResult, customersResult, notificationsResult] =
    await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(orders),
      db.select({ value: count() }).from(customers),
      db.select({ value: count() }).from(notifications),
    ]);

  const stats = {
    products: productsResult[0]?.value ?? 0,
    orders: ordersResult[0]?.value ?? 0,
    customers: customersResult[0]?.value ?? 0,
    emails: notificationsResult[0]?.value ?? 0,
  };

  // Fetch recent data in parallel for the activity feed
  const [recentOrders, recentProducts, recentCustomers] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(3),
    db.select().from(products).orderBy(desc(products.createdAt)).limit(3),
    db.select().from(customers).orderBy(desc(customers.createdAt)).limit(3),
  ]);

  // Map and combine into a single chronological activity feed
  const activities = [
    ...recentOrders.map((order) => ({
      id: `order-${order.id}`,
      type: "order" as const,
      title: "Order Placed",
      description: `For ${order.name} (${order.email})`,
      date: order.createdAt,
      status: order.status,
    })),
    ...recentProducts.map((product) => ({
      id: `product-${product.id}`,
      type: "product" as const,
      title: "Product Created",
      description: `${product.name}`,
      date: product.createdAt,
      status: product.status,
    })),
    ...recentCustomers.map((customer) => ({
      id: `customer-${customer.id}`,
      type: "customer" as const,
      title: "Customer Added",
      description: `${customer.name || customer.email}`,
      date: customer.createdAt,
      status: "active",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const statCards = [
    {
      title: "Total Products",
      value: stats.products,
      description: "Active & draft creations",
      icon: ShoppingBag,
      color: "text-primary bg-primary/10",
      border: "border-primary/20",
    },
    {
      title: "Total Orders",
      value: stats.orders,
      description: "All time bakes & bookings",
      icon: ShoppingCart,
      color: "text-accent bg-accent/10",
      border: "border-accent/20",
    },
    {
      title: "Total Customers",
      value: stats.customers,
      description: "Registered & guest profiles",
      icon: Users,
      color: "text-amber-500 bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Emails Transmitted",
      value: stats.emails,
      description: "Notifications sent via Resend",
      icon: Mail,
      color: "text-rose-500 bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  const quickActions = [
    {
      title: "New Product",
      description: "Add a new cake, cookie, or pastry creation to the catalog.",
      href: "/admin/products/new",
      icon: Package,
    },
    {
      title: "New Order",
      description: "Manually process a custom order or telephone booking.",
      href: "/admin/orders/new",
      icon: ShoppingCart,
    },
    {
      title: "New Customer",
      description:
        "Register a customer profile for custom ordering and tracking.",
      href: "/admin/customers/new",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div>
        <H1 className="font-heading">Operations Hub</H1>
        <P className="text-muted-foreground mt-1 text-sm md:text-base">
          Deelicious Bakes staff command center. Run and oversee the
          bakery&apos;s daily operations.
        </P>
      </div>

      {/* Grid of basic status counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`hover:border-primary/40 transition-all duration-300 ${card.border}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Quick Actions Panel */}
        <div className="md:col-span-3 space-y-4">
          <H2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <span>Operational Workflows</span>
          </H2>
          <div className="grid gap-4 sm:grid-cols-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href} className="group">
                  <Card className="border border-border/60 hover:border-accent/40 bg-card hover:bg-accent/5 transition-all duration-300 cursor-pointer p-4 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-muted group-hover:bg-accent/10 text-muted-foreground group-hover:text-accent transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold group-hover:text-accent transition-colors flex items-center justify-between">
                        <span>{action.title}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <Card className="md:col-span-2 border border-border/60 bg-card flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Recent System Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Live updates across storefront operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((act) => (
                  <li key={act.id} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {act.type === "order" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <ShoppingCart className="h-3 w-3" />
                        </div>
                      )}
                      {act.type === "product" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShoppingBag className="h-3 w-3" />
                        </div>
                      )}
                      {act.type === "customer" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                          <Users className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-light">
                          {new Date(act.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-light mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <h5 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  All quiet on the bakery front
                </h5>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-50">
                  No activities have been recorded in the system yet.
                </p>
              </div>
            )}

            <div className="border-t border-border/40 pt-4 mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs cursor-pointer"
              >
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-1.5"
                >
                  <span>Configure Settings</span>
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
