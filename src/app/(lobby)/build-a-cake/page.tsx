import { CakeSlice } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";

export default function BuildACakePage() {
  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center text-center px-4 py-16">
      <div className="mx-auto flex max-w-125 flex-col items-center space-y-6">
        <div className="rounded-full bg-primary/10 p-6 text-primary">
          <CakeSlice className="size-16 animate-bounce" />
        </div>
        <H1 className="font-extrabold tracking-tight">Build a Cake</H1>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-muted-foreground">
            Coming Soon!
          </p>
          <P className="text-muted-foreground">
            We are cooking up an interactive cake builder where adults and kids
            can design their own custom celebration cakes in Salisbury. Keep an
            eye out for our launch!
          </P>
        </div>
        <Button
          size="lg"
          asChild
          className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
