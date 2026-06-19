import { ImageOff } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

type PlaceholderImageProps = {
  ratio?: number;
  className?: string;
  asChild?: boolean;
  isSkeleton?: boolean;
};

export function PlaceholderImage({
  ratio,
  className,
  asChild: _asChild,
  isSkeleton = false,
}: PlaceholderImageProps) {
  const content = (
    <div
      className={cn(
        "flex h-full min-h-48 w-full items-center justify-center bg-muted text-muted-foreground",
        isSkeleton && "animate-pulse",
        className,
      )}
    >
      <ImageOff className="size-10" aria-hidden="true" />
      <span className="sr-only">Product image placeholder</span>
    </div>
  );

  if (ratio) {
    return <AspectRatio ratio={ratio}>{content}</AspectRatio>;
  }

  return content;
}
