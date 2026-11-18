import { z } from "zod";

/** Password policy: min 6 chars, at least one uppercase and one lowercase letter. */
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter");

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["vendor", "customer"]),
    businessName: z.string().optional(),
    image: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
    if (data.role === "vendor" && !data.businessName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["businessName"],
        message: "Restaurant name is required for vendors",
      });
    }
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  image: z.string().optional(),
});

export const menuItemSchema = z.object({
  itemName: z.string().min(3, "Item name is required"),
  category: z.string().min(1, "Select a category"),
  description: z
    .string()
    .min(20, "Write at least 20 characters to describe the item"),
  price: z.coerce
    .number({ message: "Price is required" })
    .positive("Price must be greater than 0")
    .max(1000, "Price looks unrealistic"),
  location: z.string().min(1, "Location is required"),
  images: z
    .string()
    .array()
    .min(1, "Upload at least one image"),
});

export const orderSchema = z.object({
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryAddress: z
    .string()
    .min(10, "Give a complete delivery address (min 10 characters)"),
  message: z.string().max(300, "Message is too long").optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Pick a rating").max(5),
  comment: z
    .string()
    .min(5, "Write a short review (min 5 characters)")
    .max(500, "Review is too long"),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.input<typeof signUpSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type MenuItemValues = z.input<typeof menuItemSchema>;
export type OrderValues = z.infer<typeof orderSchema>;
export type ReviewValues = z.infer<typeof reviewSchema>;
