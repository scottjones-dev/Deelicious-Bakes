"use client";

import { Layers, Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCategory } from "@/app/actions/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoryStat {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

interface CategoryListProps {
  initialCategories: CategoryStat[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, name: string, productCount: number) => {
    if (name.toLowerCase() === "uncategorized") {
      toast.error(
        "The system fallback 'Uncategorized' category cannot be deleted.",
      );
      return;
    }

    const confirmMsg =
      productCount > 0
        ? `Warning: This category has ${productCount} products attached. If you delete it, these products will automatically be reassigned to 'Uncategorized'. Are you sure you want to delete "${name}"?`
        : `Are you sure you want to delete the category "${name}"?`;

    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await deleteCategory(id);

      if (res.success) {
        toast.success(
          res.message || `Category "${name}" deleted successfully.`,
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete category.");
      }
    });
  };

  return (
    <Card className="border-border/40 shadow-sm bg-card/40">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Layers className="size-4.5 text-primary" />
          Active Categories ({initialCategories.length})
        </CardTitle>
        <CardDescription>
          Browse existing categories. Uncategorized fallback is highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {initialCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No categories found in the database. Add your first category using
              the form!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {initialCategories.map((cat) => {
                  const isFallback = cat.slug === "uncategorized";
                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isFallback ? "bg-primary/5 dark:bg-primary/2" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                        <span>{cat.name}</span>
                        {isFallback && (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-semibold text-primary border-primary/20 bg-primary/5 rounded-full px-2 py-0.5"
                          >
                            Fallback
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-mono">
                        {cat.slug}
                      </td>
                      <td
                        className="py-3.5 px-4 text-muted-foreground text-xs max-w-[200px] truncate"
                        title={cat.description || ""}
                      >
                        {cat.description || (
                          <span className="text-muted-foreground/45 italic">
                            No description
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant="secondary"
                          className="rounded-full font-bold"
                        >
                          {cat.productCount}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isFallback ? (
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            disabled={isPending}
                            onClick={() =>
                              handleDelete(cat.id, cat.name, cat.productCount)
                            }
                            className="cursor-pointer size-8 rounded-lg hover:bg-destructive/20 focus:ring-destructive/30"
                            title={`Delete ${cat.name}`}
                          >
                            {isPending ? (
                              <Loader2 className="size-3.5 animate-spin text-destructive" />
                            ) : (
                              <Trash className="size-3.5 text-destructive" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic px-2">
                            Protected
                          </span>
                        )}
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
  );
}
