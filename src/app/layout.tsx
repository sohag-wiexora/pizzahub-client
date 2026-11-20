import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PizzaHub — Hot & Fresh Pizza Delivered to Your Door",
    template: "%s · PizzaHub",
  },
  description:
    "PizzaHub is a premium pizza ordering & delivery platform. Discover local pizza shops, browse handcrafted menus, and track your order from oven to door.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
