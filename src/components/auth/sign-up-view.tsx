"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Store, UserRound, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import { signUpSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";
import { ImageUpload } from "@/components/auth/image-upload";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

type RoleOption = Exclude<UserRole, "admin">;

/** Sign Up — role picker (vendor/customer), password policy, optional ImgBB avatar. */
export function SignUpView() {
  const router = useRouter();
  const { signUp, signInWithGoogle, user, isLoading } = useAuth();

  const [role, setRole] = useState<RoleOption>(
    "customer",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !user.isBlocked) {
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = signUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      role,
      businessName: role === "vendor" ? businessName : undefined,
      image,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const result = await signUp(parsed.data);
    setSubmitting(false);
    if (!result.ok) {
      toast.error("Sign up failed", { description: result.message });
      return;
    }
    toast.success("Account created!", {
      description:
        role === "vendor"
          ? "Your restaurant profile is ready — add your first menu item."
          : "Start exploring menus and place your first order.",
    });
    router.replace("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) {
      toast.error("Google sign in failed", { description: result.message });
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-gold/20 bg-background/95 p-8 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.65)] sm:p-10">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-3xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join as a customer or a restaurant — admins are provisioned
          internally for security.
        </p>
      </div>

      {/* role picker */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {(
          [
            {
              value: "customer" as RoleOption,
              icon: UserRound,
              title: "Customer",
              text: "Order & track pizzas",
            },
            {
              value: "vendor" as RoleOption,
              icon: Store,
              title: "Vendor",
              text: "Sell from your kitchen",
            },
          ]
        ).map(({ value, icon: Icon, title, text }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
              role === value
                ? "border-gold bg-gold/10 shadow-[0_0_0_1px_var(--gold)]"
                : "border-border bg-card hover:border-gold/40",
            )}
            aria-pressed={role === value}
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                role === value
                  ? "bg-gold text-forest-deep"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-muted-foreground">{text}</span>
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl"
          />
          {errors.name ? (
            <p className="text-xs font-medium text-destructive">{errors.name}</p>
          ) : null}
        </div>

        {role === "vendor" ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessName">Restaurant / Business Name</Label>
            <Input
              id="businessName"
              placeholder="e.g. Slice Town"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.businessName ? (
              <p className="text-xs font-medium text-destructive">
                {errors.businessName}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl"
          />
          {errors.email ? (
            <p className="text-xs font-medium text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs font-medium text-destructive">
                {errors.password}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.confirmPassword ? (
              <p className="text-xs font-medium text-destructive">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 p-3">
          <ImageUpload
            value={image}
            onChange={setImage}
            label="Profile Image (optional)"
          />
          <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
            Min 6 characters, one uppercase &amp; one lowercase letter in the
            password. You can skip the image and add it later.
          </p>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-xl bg-gold text-forest-deep hover:bg-gold-light"
        >
          {submitting ? "Creating account…" : (
            <>
              <UserPlus className="size-4" /> Create Account
            </>
          )}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton onClick={handleGoogle} loading={googleLoading} />

        <p className="mt-1 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-gold hover:text-gold-light"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
