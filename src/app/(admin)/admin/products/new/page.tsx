"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { H1, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, ShieldAlert, AlertCircle, Loader2, Leaf, Ban } from "lucide-react";
import { AdminProductPhotoManager } from "@/components/uploadthing/product-uploader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Interactive Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [isCollectionOnly, setIsCollectionOnly] = useState(false);
  const [status, setStatus] = useState("draft");
  const [category, setCategory] = useState("cakes");
  const [images, setImages] = useState<Array<{ url: string; key: string }>>([]);

  // Food Safety States (Natasha's Law Compliance)
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);

  const handleDietaryTagToggle = (tag: string) => {
    if (selectedDietaryTags.includes(tag)) {
      setSelectedDietaryTags(selectedDietaryTags.filter((t) => t !== tag));
    } else {
      setSelectedDietaryTags([...selectedDietaryTags, tag]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
// TODO make live
    e.preventDefault();
    if (!title) {
      toast.error("Please enter a product title before saving.");
      return;
    }

    try {
      setIsSaving(true);
      // Simulate API insertion delay for visual/operational feedback
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Staged Product Payload:", {
        title,
        description,
        leadTimeDays,
        isCollectionOnly,
        status,
        category,
        images,
        foodSafety: {
          ingredients,
          allergens,
          dietaryTags: selectedDietaryTags,
        }
      });

      toast.success(`Successfully saved "${title}" into store catalog drafts!`);
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("An operational error occurred while creating this product.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableDietaryTags = [
    { name: "Gluten-Free", icon: Ban, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { name: "Vegan", icon: Leaf, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Nut-Free", icon: Ban, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    { name: "Dairy-Free", icon: Ban, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Go Back Link */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground cursor-pointer">
          <Link href="/admin/products" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <H1 className="font-heading">Create New Product</H1>
        <P className="text-muted-foreground text-sm">
          Add a brand-new gourmet cake, confection, or customized bake option to your active store catalog.
        </P>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Product Identity</CardTitle>
              <CardDescription className="text-xs">
                Essential metadata that represents this creation across the customer storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="product-title" className="text-xs font-bold text-foreground uppercase tracking-wider">Product Title</label>
                <input
                  id="product-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Artisanal Velvet Strawberry Sponge Cake"
                  required
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="product-description" className="text-xs font-bold text-foreground uppercase tracking-wider">Storefront Description</label>
                <textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a delicious description, allergens, and serving size details..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Food Safety, Ingredients & Allergens (Natasha's Law Compliant) */}
          <Card className="border border-rose-500/20 bg-rose-500/2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-500">
                  Ingredients & Food Safety
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground/80">
                Natasha&apos;s Law Compliant. Specify ingredients and highlight allergens clearly for customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dietary Classifications */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Dietary Classifications (Storefront Badges)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableDietaryTags.map((tag) => {
                    const TagIcon = tag.icon;
                    const isSelected = selectedDietaryTags.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => handleDietaryTagToggle(tag.name)}
                        className={cn(
                          "flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? `${tag.color} border-current font-bold ring-1 ring-current`
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <TagIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{tag.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Ingredients Formulation */}
              <div className="grid gap-2">
                <label htmlFor="product-ingredients" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Ingredients Statement
                </label>
                <textarea
                  id="product-ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g. Wheat flour (gluten), organic strawberries, free-range eggs, milk butter, sugar, vanilla extract."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <span className="text-[10px] text-muted-foreground font-light">
                  List ingredients in descending order of weight. Highlight specific allergy-inducing items.
                </span>
              </div>

              {/* Highlighted Allergens */}
              <div className="grid gap-2">
                <label htmlFor="product-allergens" className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Explicit Allergen Warnings
                </label>
                <input
                  id="product-allergens"
                  type="text"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  placeholder="e.g. Wheat (Gluten), Eggs, Dairy, Soy. May contain traces of nuts."
                  className="w-full px-3 py-2 text-sm bg-background border border-rose-500/20 text-rose-600 font-medium placeholder:text-muted-foreground/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <span className="text-[10px] text-rose-500/80 font-light">
                  This statement will be flagged with a warning icon on the product page.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Real Uploadthing Integration */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Confectionery Visuals</CardTitle>
              <CardDescription className="text-xs">
                Upload beautiful, high-resolution imagery of your bakes to entice buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProductPhotoManager onImagesChanged={(uploadedImages) => setImages(uploadedImages)} />
            </CardContent>
          </Card>

          {/* Delivery constraints */}
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Fulfillment & Constraints</CardTitle>
              <CardDescription className="text-xs">
                Time rules and collection parameters essential for bakery planning.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="lead-time" className="text-xs font-bold text-foreground uppercase tracking-wider">Lead Time (Days)</label>
                <input
                  id="lead-time"
                  type="number"
                  min="0"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
                  placeholder="3"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground font-light">Minimum notice needed to bake this item.</span>
              </div>

              <div className="grid gap-2">
                <label htmlFor="collection-only" className="text-xs font-bold text-foreground uppercase tracking-wider">Fulfillment Limitations</label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    id="collection-only"
                    type="checkbox"
                    checked={isCollectionOnly}
                    onChange={(e) => setIsCollectionOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                  />
                  <label htmlFor="collection-only" className="text-xs text-muted-foreground font-medium cursor-pointer select-none">
                    Strictly Collection Only
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status and Actions sidebar */}
        <div className="space-y-6">
          <Card className="border border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Catalog Placement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="publish-status" className="text-xs font-bold text-foreground uppercase tracking-wider">Publishing Status</label>
                <select
                  id="publish-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active / Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="product-category" className="text-xs font-bold text-foreground uppercase tracking-wider">Product Category</label>
                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground font-light focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="cakes">Cakes</option>
                  <option value="cookies">Cookies & Biscuits</option>
                  <option value="cupcakes">Cupcakes</option>
                  <option value="pastries">Bespoke Pastries</option>
                </select>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <Button type="submit" disabled={isSaving} className="w-full cursor-pointer">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      <span>Saving Bake...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      <span>Save Creation</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" type="button" asChild className="w-full cursor-pointer text-muted-foreground">
                  <Link href="/admin/products">
                    <span>Cancel Changes</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/10 bg-amber-500/5">
            <CardContent className="pt-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wide">Operations Guard</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                  Images uploaded are stored immediately in UploadThing cloud storage. Form submissions will log details to consoles when in sandbox mode.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
