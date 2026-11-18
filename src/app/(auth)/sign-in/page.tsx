import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInView } from "@/components/auth/sign-in-view";
import { PageLoader } from "@/components/shared/loader";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to PizzaHub with email or Google.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInView />
    </Suspense>
  );
}
