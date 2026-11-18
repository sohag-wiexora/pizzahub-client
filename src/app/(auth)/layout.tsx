import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/** Minimal luxury shell for the auth pages (no navbar/footer). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-forest-deep">
      {/* ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 size-[28rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[24rem] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo tone="light" href="/" />
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-ivory hover:bg-white/10" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 px-4 py-2 text-sm font-medium text-ivory/85 transition-colors hover:border-gold hover:text-ivory"
          >
            <ChevronLeft className="size-4" /> Back to Home
          </Link>
        </div>
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        {children}
      </main>
    </div>
  );
}
