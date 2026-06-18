import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorCardProps = {
  title: string;
  description: string;
  retryLink?: string;
  retryLinkText?: string;
};

export function ErrorCard({
  title,
  description,
  retryLink,
  retryLinkText = "Try again",
}: ErrorCardProps) {
  return (
    <Card className="w-full border-destructive/15 bg-card/80 shadow-sm">
      <CardHeader>
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {retryLink ? (
          <Link
            href={retryLink}
            className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
          >
            {retryLinkText}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
