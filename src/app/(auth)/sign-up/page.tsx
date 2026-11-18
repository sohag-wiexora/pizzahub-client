import type { Metadata } from "next";
import { SignUpView } from "@/components/auth/sign-up-view";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a customer or vendor account on PizzaHub.",
};

export default function SignUpPage() {
  return <SignUpView />;
}
