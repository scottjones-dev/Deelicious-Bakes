import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Signature } from "@/components/ui/typography";
import VerifyEmailContent from "./verify-email-content";

export const metadata: Metadata = {
    title: "Verify Email | Deelicious Bakes",
};

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background">
            <div className="flex w-full max-w-md flex-col gap-6">
                <div className="flex items-center justify-center gap-2 py-6">
                    <Signature className="text-primary text-5xl">Deelicious Bakes</Signature>
                </div>
                
                <Suspense fallback={
                    <div className="flex flex-col items-center gap-4 p-8 text-muted-foreground bg-card rounded-xl border border-primary/10 shadow-lg">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p>Loading verification system...</p>
                    </div>
                }>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}

