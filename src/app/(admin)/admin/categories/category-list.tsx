"use client";

import { Check, Edit3, Layers, Loader2, Trash, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategory, updateCategory } from "@/app/actions/category";
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
import { UploadButton } from "@/utils/uploadthing";

interface CategoryStat {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  productCount: number;
}

interface CategoryListProps {
  initialCategories: CategoryStat[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");

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

  const startEditing = (category: CategoryStat) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? "");
    setEditImage(category.image ?? "");
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setEditDescription("");
    setEditImage("");
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editName.trim() || !editSlug.trim()) {
      toast.error("Category name and slug are required.");
      return;
    }

    startTransition(async () => {
      const res = await updateCategory(editingId, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim() || undefined,
        image: editImage.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Category "${editName}" updated successfully.`);
        stopEditing();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update category.");
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
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {initialCategories.map((cat) => {
                  const isFallback = cat.slug === "uncategorized";
                  const isEditing = editingId === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isFallback ? "bg-primary/5 dark:bg-primary/2" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={isPending}
                              className="h-8"
                            />
                          ) : (
                            <span>{cat.name}</span>
                          )}
                          {isFallback && (
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-semibold text-primary border-primary/20 bg-primary/5 rounded-full px-2 py-0.5"
                            >
                              Fallback
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-mono">
                        {isEditing ? (
                          <Input
                            value={editSlug}
                            onChange={(e) =>
                              setEditSlug(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, ""),
                              )
                            }
                            disabled={isPending}
                            className="h-8"
                          />
                        ) : (
                          cat.slug
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={editImage}
                              onChange={(e) => setEditImage(e.target.value)}
                              placeholder="https://..."
                              disabled={isPending}
                              className="h-8"
                            />
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                const uploadedUrl = res[0]?.ufsUrl;
                                if (uploadedUrl) {
                                  setEditImage(uploadedUrl);
                                }
                              }}
                              onUploadError={(error: Error) => {
                                toast.error(
                                  `Failed to upload image: ${error.message}`,
                                );
                              }}
                              className="ut-button:h-7 ut-button:px-2 ut-button:text-xs ut-button:bg-primary ut-button:ut-readying:bg-primary/70 ut-button:ut-uploading:bg-primary/50 ut-label:text-primary"
                            />
                          </div>
                        ) : cat.image ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border/50">
                            <Image
                              src={cat.image}
                              alt={`${cat.name} image`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">
                            No image
                          </span>
                        )}
                      </td>
                      <td
                        className="py-3.5 px-4 text-muted-foreground text-xs max-w-50 truncate"
                        title={
                          isEditing ? editDescription : (cat.description ?? "")
                        }
                      >
                        {isEditing ? (
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            disabled={isPending}
                            className="h-8"
                          />
                        ) : (
                          cat.description || (
                            <span className="text-muted-foreground/45 italic">
                              No description
                            </span>
                          )
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
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={isPending}
                                  onClick={handleSaveEdit}
                                  className="cursor-pointer size-8 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                  title="Save category changes"
                                >
                                  {isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Check className="size-3.5" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={isPending}
                                  onClick={stopEditing}
                                  className="cursor-pointer size-8 rounded-lg"
                                  title="Cancel editing"
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon-sm"
                                  disabled={isPending}
                                  onClick={() => startEditing(cat)}
                                  className="cursor-pointer size-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                  title={`Edit ${cat.name}`}
                                >
                                  <Edit3 className="size-3.5" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon-sm"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleDelete(
                                      cat.id,
                                      cat.name,
                                      cat.productCount,
                                    )
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
                              </>
                            )}
                          </div>
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
