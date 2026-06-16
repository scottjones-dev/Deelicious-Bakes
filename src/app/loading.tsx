import { Spinner } from "@/components/ui/spinner";
import { Signature } from "@/components/ui/typography";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        <Signature className="text-5xl text-primary animate-pulse">
          Dee-licious
        </Signature>
        <div className="flex flex-col items-center gap-2">
          <Spinner className="h-8 w-8 text-accent" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium animate-pulse">
            Heating the oven...
          </p>
        </div>
      </div>
    </div>
  );
}
