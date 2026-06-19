"use client";

import { Loader2, Plus, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCategory } from "@/app/actions/category";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-compute slug
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    if (!slug.trim()) {
      toast.error("Please enter a slug.");
      return;
    }

    startTransition(async () => {
      const res = await createCategory({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Category "${name}" created successfully! 🍰`);
        setName("");
        setSlug("");
        setDescription("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create category.");
      }
    });
  };

  return (
    <Card className="border-border/40 shadow-sm bg-card/40">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Store className="size-4.5 text-primary" />
          Add Category
        </CardTitle>
        <CardDescription>
          Create a new product grouping for the catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="cat-name"
              className="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Category Name
            </label>
            <Input
              id="cat-name"
              type="text"
              placeholder="e.g. Birthday Cakes"
              value={name}
              onChange={handleNameChange}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="cat-slug"
              className="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              URL Slug
            </label>
            <Input
              id="cat-slug"
              type="text"
              placeholder="e.g. birthday-cakes"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="cat-desc"
              className="text-xs font-bold text-foreground uppercase tracking-wider"
            >
              Description (Optional)
            </label>
            <Textarea
              id="cat-desc"
              placeholder="e.g. Customized multi-tier sponge cakes crafted to order."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating Category...</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Add Category</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
