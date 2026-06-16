import { Metadata } from "next";
import { SignupForm } from "@/components/auth/sign-up-form";
import { Signature } from "@/components/ui/typography"; 

export const metadata: Metadata = {
    title: "Create an Account | Dee-licious Bakes",
};

export default function SignUpPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex items-center justify-center gap-2 py-6">
                    <Signature className="text-primary text-5xl">Deelicious Bakes</Signature>
                </div>
                <SignupForm />
            </div>
        </div>
    );
}