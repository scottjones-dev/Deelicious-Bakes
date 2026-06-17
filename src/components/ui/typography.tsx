import type React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLElement>;

/**
 * DISPLAY TYPOGRAPHY (Brand Identity)
 * Uses signature font for bakery styling
 */

export function H1({ className, ...props }: Props) {
  return (
    <h1
      className={cn(
        "font-signature text-5xl md:text-6xl leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function H2({ className, ...props }: Props) {
  return (
    <h2
      className={cn(
        "font-signature text-4xl md:text-5xl leading-tight tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function H3({ className, ...props }: Props) {
  return (
    <h3
      className={cn(
        "font-signature text-3xl md:text-4xl leading-tight tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

/**
 * BODY TYPOGRAPHY (UI / readability system)
 */

export function P({ className, ...props }: Props) {
  return (
    <p
      className={cn(
        "font-sans text-base leading-7 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Lead({ className, ...props }: Props) {
  return (
    <p
      className={cn(
        "font-sans text-lg md:text-xl leading-8 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Muted({ className, ...props }: Props) {
  return (
    <p
      className={cn("font-sans text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * BRAND SIGNATURE (single-word emphasis only)
 * NOT for headings — use for logo / accent words only
 */

export function Signature({ className, ...props }: Props) {
  return (
    <span
      className={cn(
        "font-signature text-5xl md:text-6xl leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
