"use client";

import { Loader2, Send } from "lucide-react";
import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinNewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      // Simulate newsletter signup (or call actual subscription api in the future)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        "Welcome! You have successfully subscribed to the Deelicious Bakes newsletter. 🍰",
      );
      setEmail("");
    });
  };

  return (
    <form onSubmit={handleSubscribe} className="space-y-2 max-w-sm">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className="bg-background/50 border-border/80 text-sm focus-visible:ring-primary h-10 w-full"
        />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 h-10 shrink-0"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-1.5">
              Subscribe
              <Send className="size-3.5" />
            </span>
          )}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground/80">
        By subscribing, you agree to receive launch updates and sweet offers.
        Unsubscribe at any time.
      </p>
    </form>
  );
}
