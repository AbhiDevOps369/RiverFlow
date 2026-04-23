"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/Auth";
import Link from "next/link";

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};

export default function ForgotPassword() {
    const { forgotPassword } = useAuthStore();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");

        if (!email) {
            setError("Please enter your email");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        const url = `${window.location.origin}/reset-password`;
        const response = await forgotPassword(email.toString(), url);
        if (response.error) {
            setError(response.error.message);
        } else {
            setSuccess("Password recovery email sent. Please check your inbox.");
        }

        setIsLoading(false);
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-none border border-solid border-white/30 bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Forgot Password
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
                <p className="mt-8 text-center text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            {success && (
                <p className="mt-8 text-center text-sm text-green-500 dark:text-green-400">{success}</p>
            )}
            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        className="text-black"
                        id="email"
                        name="email"
                        placeholder="projectmayhem@fc.com"
                        type="email"
                    />
                </LabelInputContainer>

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    disabled={isLoading}
                >
                    Send Recovery Email &rarr;
                    <BottomGradient />
                </button>

                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-orange-500 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
