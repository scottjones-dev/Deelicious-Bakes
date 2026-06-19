import { ErrorCard } from "@/components/error-card";
import { Shell } from "@/components/shell";

export default function ProductModalNotFound() {
  return (
    <Shell variant="centered" className="max-w-md">
      <ErrorCard
        title="Product not found"
        description="The product may have been removed, or the link is no longer valid."
        retryLink="/"
        retryLinkText="Go to Home"
      />
    </Shell>
  );
}
