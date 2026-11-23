"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/browse-menu", label: "Browse Menu" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  vendor: "Restaurant Owner",
  customer: "Customer",
};

/** Sticky forest-noir navbar. Updates instantly when auth state changes. */
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isVendor, isCustomer, signOut, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out", {
      description: "See you soon — the oven stays warm.",
    });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 glass-forest border-b border-gold/15">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo tone="light" href="/" className="shrink-0" />

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active(link.href)
                  ? "text-gold"
                  : "text-ivory/80 hover:text-ivory",
              )}
            >
              {link.label}
              {active(link.href) ? (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold" />
              ) : null}
            </Link>
          ))}
          {user ? (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active("/dashboard") ? "text-gold" : "text-ivory/80 hover:text-ivory",
              )}
            >
              Dashboard
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="text-ivory hover:bg-white/10" />

          {isLoading ? (
            <div className="hidden h-10 w-40 animate-pulse rounded-full bg-white/10 lg:block" />
          ) : user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-full border border-gold/25 bg-white/5 py-1.5 pl-1.5 pr-3 transition-colors hover:border-gold/50">
                    <Avatar className="size-8 border border-gold/40">
                      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                      <AvatarFallback className="bg-gradient-to-br from-gold to-[#a8801f] text-xs font-bold text-forest-deep">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-28 truncate text-sm font-medium text-ivory">
                      {user.name}
                    </span>
                    <ChevronDown className="size-4 text-gold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 border-border">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                      <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-gold/12 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-gold">
                        <Sparkles className="size-3" />
                        {roleLabel[user.role]}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="size-4 text-gold" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile-settings">
                      <Settings className="size-4 text-gold" /> Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    variant="destructive"
                  >
                    <LogOut className="size-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-ivory hover:bg-white/10 hover:text-ivory"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-gold text-forest-deep hover:bg-gold-light"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-ivory hover:bg-white/10 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 border-gold/20 bg-forest-deep p-0"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-gold/15 p-5">
                  <Logo tone="light" />
                </div>
                <nav className="flex flex-1 flex-col gap-1 p-4">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        active(link.href)
                          ? "bg-gold/15 text-gold"
                          : "text-ivory/80 hover:bg-white/5 hover:text-ivory",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        active("/dashboard")
                          ? "bg-gold/15 text-gold"
                          : "text-ivory/80 hover:bg-white/5 hover:text-ivory",
                      )}
                    >
                      Dashboard
                    </Link>
                  ) : null}
                  {isCustomer ? (
                    <Link
                      href="/dashboard/favorites"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
                    >
                      My Favorites
                    </Link>
                  ) : null}
                  {isVendor ? (
                    <Link
                      href="/dashboard/subscription"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
                    >
                      Subscription
                    </Link>
                  ) : null}
                </nav>
                <div className="space-y-2 border-t border-gold/15 p-4">
                  {user ? (
                    <>
                      <Link
                        href="/profile-settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ivory/80 hover:bg-white/5"
                      >
                        <Settings className="size-4 text-gold" />
                        Profile Settings
                      </Link>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full rounded-full border-red-400/40 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
                      >
                        <LogOut className="size-4" /> Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full rounded-full border-gold/40 bg-transparent text-ivory hover:bg-white/10 hover:text-ivory">
                        <Link href="/sign-in" onClick={() => setOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full rounded-full bg-gold text-forest-deep hover:bg-gold-light"
                      >
                        <Link href="/sign-up" onClick={() => setOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
