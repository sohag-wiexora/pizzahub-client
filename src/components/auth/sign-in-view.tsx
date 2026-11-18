"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";
import { useAuth } from "@/components/providers/auth-provider";

/** Sign In — credentials + Google, redirect honouring ?next= */
export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, user, isLoading, demoAccounts, isMock } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const nextPath = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    if (!isLoading && user && !user.isBlocked) {
      router.replace(nextPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (!result.ok) {
      toast.error("Sign in failed", { description: result.message });
      return;
    }
    toast.success("Welcome back!", {
      description: "Your oven is preheated — let's get ordering.",
    });
    router.replace(nextPath);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) {
      toast.error("Google sign in failed", { description: result.message });
      return;
    }
    router.replace(nextPath);
  };

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-gold/20 bg-forest-soft/40 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.65)] backdrop-blur md:grid-cols-[0.9fr_1.1fr]">
      {/* brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-deep p-10 text-ivory md:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-1/3 size-72 rounded-full bg-gold/10 blur-[90px]" />
        </div>
        <div className="relative">
          <h2 className="font-heading text-3xl font-bold leading-snug">
            Welcome back to{" "}
            <span className="text-gradient-gold">PizzaHub</span>
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/65">
            Sign in to track orders, manage your menu and unlock your
            personalised dashboard.
          </p>
        </div>
        {isMock ? (
          <div className="relative rounded-2xl border border-gold/25 bg-white/[0.04] p-4">
            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">
              Demo accounts
            </p>
            <ul className="space-y-1.5 text-xs text-ivory/75">
              {demoAccounts.map((account) => (
                <li
                  key={account.email}
                  className="flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="rounded-full bg-gold/15 px-2.5 py-0.5 font-semibold text-gold-light transition-colors hover:bg-gold/30"
                  >
                    {account.label}
                  </button>
                  <span className="truncate font-mono text-[0.65rem] text-ivory/55">
                    {account.email}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.65rem] text-ivory/45">
              Click a badge to prefill the form.
            </p>
          </div>
        ) : null}
      </div>

      {/* form */}
      <div className="bg-background/95 p-8 sm:p-10">
        <div className="mb-7 text-center md:text-left">
          <h1 className="font-heading text-3xl font-bold">Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to continue.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.email ? (
              <p className="text-xs font-medium text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-xl bg-gold text-forest-deep hover:bg-gold-light"
          >
            {submitting ? "Signing in…" : (
              <>
                <LogIn className="size-4" /> Sign In
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

          <p className="mt-2 text-center text-sm text-muted-foreground">
            New to PizzaHub?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-gold hover:text-gold-light"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
