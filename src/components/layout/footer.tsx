import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";

/** Brand icons as inline SVG (lucide no longer ships brand icons). */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The new X logo (not the old Twitter bird). */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.58 7.19a2.77 2.77 0 0 0-1.95-1.96C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.63.48A2.77 2.77 0 0 0 2.42 7.2 29.1 29.1 0 0 0 2 12.01c0 1.62.14 3.24.42 4.82a2.77 2.77 0 0 0 1.95 1.96c1.73.48 7.63.48 7.63.48s5.9 0 7.63-.48a2.77 2.77 0 0 0 1.95-1.96c.28-1.58.42-3.2.42-4.82s-.14-3.24-.42-4.82ZM9.75 15.02V8.99l5.25 3.02-5.25 3.01Z" />
    </svg>
  );
}

/** Computed once at build time — Cache Components blocks render-time Date. */
const COPYRIGHT_YEAR = new Date().getFullYear();

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/browse-menu", label: "Browse Menu" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

const supportLinks = [
  { href: "/browse-menu?category=Sides+%26+Appetizers", label: "Sides & Appetizers" },
  { href: "/browse-menu?sort=price-asc", label: "Best Value Pizzas" },
  { href: "/browse-menu?sort=rating", label: "Top Rated Items" },
  { href: "/sign-up?role=vendor", label: "Become a Vendor" },
];

export function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-forest-deep text-ivory">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="space-y-4">
            <Logo tone="light" />
            <p className="max-w-xs text-sm leading-relaxed text-ivory/65">
              PizzaHub connects pizza lovers with the finest local kitchens.
              Handcrafted menus, verified vendors and door-to-door delivery —
              hot, fresh and always on time.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: FacebookIcon, label: "Facebook" },
                { icon: InstagramIcon, label: "Instagram" },
                { icon: XIcon, label: "X" },
                { icon: YoutubeIcon, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-gold/25 text-ivory/70 transition-colors hover:border-gold hover:bg-gold hover:text-forest-deep"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* explore */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ivory/70 transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* support */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ivory/70 transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                House 42, Road 8, Dhanmondi, Dhaka 1205
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold" />
                +880 1700-000000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold" />
                hello@pizzahub.com
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-gold" />
                Open daily · 10:00 AM – 11:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gold/15 pt-6 text-xs text-ivory/50 sm:flex-row">
          <p>© {COPYRIGHT_YEAR} PizzaHub. All rights reserved.</p>
          <p className="font-heading italic text-gold/70">
            Baked with passion in Forest Noir & Champagne Gold.
          </p>
        </div>
      </div>
    </footer>
  );
}
