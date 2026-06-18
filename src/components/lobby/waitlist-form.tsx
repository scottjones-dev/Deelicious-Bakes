"use client";

import { ArrowRight, CheckCircle, Loader2, Mail, User } from "lucide-react";
import type * as React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeToWaitlist } from "@/app/(lobby)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      const result = await subscribeToWaitlist({ email, name });

      if (result.success) {
        toast.success(result.message);
        setIsSuccess(true);
        setName("");
        setEmail("");
      } else {
        toast.error(result.error || "Something went wrong. Please try again.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center bg-card/40 border border-primary/20 rounded-2xl p-8 max-w-md w-full mx-auto text-center animate-fade-in shadow-lg">
        <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary animate-bounce">
          <CheckCircle className="size-10" />
        </div>
        <h3 className="font-sans text-xl font-bold text-foreground mb-2">
          You're on the list!
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
          Thank you for joining Deelicious Bakes! We've sent a sweet welcome
          email to your inbox. We'll keep you posted on launch dates, menu
          updates, and first-order access.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary px-6 py-2 transition-all"
        >
          Add another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="relative flex items-center">
        <User className="absolute left-4 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          name="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
          className="pl-11 h-12 rounded-full border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary transition-all pr-4"
        />
      </div>

      <div className="relative flex items-center">
        <Mail className="absolute left-4 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
          className="pl-11 h-12 rounded-full border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary transition-all pr-4"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-70 shadow-md group"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Reserving your spot...</span>
          </>
        ) : (
          <>
            <span>Join the Waitlist</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
      <p className="text-[10px] text-center text-muted-foreground/80 mt-2">
        Zero spam. Only fresh baking updates, exclusive discounts, and launch
        invitations.
      </p>
    </form>
  );
}
