import { PageLoader } from "@/components/shared/loader";

/** Route-level fallback while a segment's UI streams in. */
export default function Loading() {
  return <PageLoader label="Warming up the oven…" />;
}
