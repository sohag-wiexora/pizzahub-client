"use client";

import { useEffect, useState } from "react";
import { Crown, Loader2, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/auth/image-upload";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDate } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  vendor: "Restaurant Owner",
  customer: "Customer",
};

/** Profile Settings — name & image editable; role/plan intentionally locked. */
export function ProfileSettingsView() {
  const { user, updateProfile, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setImage(user.image);
    }
  }, [user]);

  if (isLoading) return null;
  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name is too short");
      return;
    }
    setSaving(true);
    const result = await updateProfile({ name: name.trim(), image });
    setSaving(false);
    if (!result.ok) {
      toast.error("Could not update profile", { description: result.message });
      return;
    }
    setDirty(false);
    toast.success("Profile updated", {
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name and profile image. Role and subscription are
          managed by the platform for security.
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6">
        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <UserRound className="size-5 text-gold" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <ImageUpload
              value={image}
              onChange={(url) => {
                setImage(url);
                setDirty(true);
              }}
              label="Profile Image"
              hint="Optional · ImgBB hosting"
            />
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setDirty(true);
                  }}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  value={user.email}
                  disabled
                  className="h-11 rounded-xl opacity-70"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <ShieldCheck className="size-5 text-gold" /> Account &amp; Security
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge className="gap-1.5 border-gold/40 bg-gold/10 text-gold">
              <UserRound className="size-3" />
              {roleLabels[user.role]}
            </Badge>
            {user.role === "vendor" ? (
              <>
                <Badge className="border-transparent bg-forest text-gold-light">
                  {user.businessName ?? "Vendor"}
                </Badge>
                <Badge
                  className={
                    user.subscriptionPlan === "premium"
                      ? "gap-1 border-transparent bg-gradient-to-r from-gold to-gold-light text-forest-deep"
                      : "border-border bg-muted text-muted-foreground"
                  }
                >
                  <Crown className="size-3" />
                  {user.subscriptionPlan === "premium" ? "Premium Plan" : "Free Plan"}
                </Badge>
                {user.subscriptionExpiresAt ? (
                  <span className="text-xs text-muted-foreground">
                    Renews {formatDate(user.subscriptionExpiresAt)}
                  </span>
                ) : null}
              </>
            ) : null}
            <p className="w-full text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mr-1 inline size-3 text-gold" />
              Role and subscription status cannot be changed through profile
              updates — this is enforced on the server as well.
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving || !dirty}
          className="h-11 self-start rounded-full bg-gold px-8 text-forest-deep hover:bg-gold-light"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" /> Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
