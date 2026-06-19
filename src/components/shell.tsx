import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ShellProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "centered";
};

export function Shell({
  className,
  variant = "default",
  ...props
}: ShellProps) {
  return (
    <div
      className={cn(
        "container mx-auto w-full px-4 py-10",
        variant === "centered" &&
          "flex min-h-[60vh] items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}
