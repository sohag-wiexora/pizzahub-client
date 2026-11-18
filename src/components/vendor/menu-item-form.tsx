"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem, MenuItemInput } from "@/types";
import { PIZZA_CATEGORIES, LOCATIONS } from "@/config/constants";
import { createMenuItem, updateMenuItem } from "@/lib/api-client";
import { menuItemSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/auth/image-upload";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Shared create/edit form for vendor menu items.
 * Images are uploaded to ImgBB; status resets to Pending on create.
 */
export function MenuItemForm({ item }: { item?: MenuItem }) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = Boolean(item);

  const [itemName, setItemName] = useState(item?.itemName ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [images, setImages] = useState<string[]>(item?.images ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const addImage = (url: string) => setImages((prev) => [...prev, url]);
  const removeImage = (url: string) =>
    setImages((prev) => prev.filter((i) => i !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});

    const parsed = menuItemSchema.safeParse({
      itemName,
      category,
      description,
      price,
      location,
      images,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload: MenuItemInput = {
        itemName: itemName.trim(),
        category,
        description: description.trim(),
        price: Number(price),
        location,
        images,
      };
      if (isEdit && item) {
        await updateMenuItem(item._id, user.id, payload);
        toast.success("Item updated", {
          description: `${payload.itemName} has been saved.`,
        });
        router.push("/dashboard/menu-items");
      } else {
        const created = await createMenuItem(user.id, payload);
        toast.success("Item submitted for review", {
          description: `${created.itemName} is pending admin approval.`,
        });
        router.push("/dashboard/menu-items");
      }
    } catch (err: unknown) {
      toast.error(isEdit ? "Could not update item" : "Could not create item", {
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 gap-1.5 text-muted-foreground hover:text-gold"
        >
          <Link href="/dashboard/menu-items">
            <ArrowLeft className="size-4" /> My Menu Items
          </Link>
        </Button>
        <h1 className="font-heading text-3xl font-bold">
          {isEdit ? "Edit Menu Item" : "Add Menu Item"}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-3.5 text-gold" />
          New items are reviewed by admins before going live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-name">Item Name</Label>
          <Input
            id="item-name"
            placeholder="e.g. Margherita Classica"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="h-11 rounded-xl"
          />
          {errors.itemName ? (
            <p className="text-xs font-medium text-destructive">{errors.itemName}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={category || undefined} onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-xl" aria-label="Select category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PIZZA_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? (
              <p className="text-xs font-medium text-destructive">{errors.category}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-price">Price (USD)</Label>
            <Input
              id="item-price"
              type="number"
              min="0.5"
              step="0.01"
              placeholder="12.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.price ? (
              <p className="text-xs font-medium text-destructive">{errors.price}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-description">Description</Label>
          <Textarea
            id="item-description"
            placeholder="What makes this pizza special? Ingredients, flavour, story…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 rounded-xl"
          />
          {errors.description ? (
            <p className="text-xs font-medium text-destructive">{errors.description}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Location (area / city)</Label>
          <Select value={location || undefined} onValueChange={setLocation}>
            <SelectTrigger className="h-11 rounded-xl" aria-label="Select location">
              <SelectValue placeholder="Select your service area" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.location ? (
            <p className="text-xs font-medium text-destructive">{errors.location}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Item Images{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (required · uploaded to ImgBB)
            </span>
          </Label>
          <div className="flex flex-wrap items-start gap-3">
            {images.map((url) => (
              <div
                key={url}
                className="group relative h-24 w-32 overflow-hidden rounded-xl border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Menu item" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute inset-0 flex items-center justify-center bg-forest-deep/60 text-xs font-semibold text-ivory opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
            {images.length < 4 ? (
              <ImageUpload
                value={undefined}
                onChange={(url) => url && addImage(url)}
                label=""
                aspect="wide"
              />
            ) : null}
          </div>
          {errors.images ? (
            <p className="text-xs font-medium text-destructive">{errors.images}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-full bg-gold text-forest-deep hover:bg-gold-light"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              {isEdit ? "Save Changes" : "Submit for Review"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
