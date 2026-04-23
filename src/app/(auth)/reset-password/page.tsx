"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/Auth";
import { useRouter, useSearchParams } from "next/navigation";
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

function ResetPasswordForm() {
    const { resetPassword } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    useEffect(() => {
        if (!userId || !secret) {
            setError("Invalid or missing recovery tokens. Please request a new password reset link.");
        }
    }, [userId, secret]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userId || !secret) {
            setError("Invalid or missing recovery tokens.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (!password || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        const response = await resetPassword(userId, secret, password.toString());
        if (response.error) {
            setError(response.error.message);
        } else {
            setSuccess("Password reset successfully. You can now log in.");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        }

        setIsLoading(false);
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-none border border-solid border-white/30 bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Reset Password
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Enter your new password below.
            </p>

            {error && (
                <p className="mt-8 text-center text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            {success && (
                <p className="mt-8 text-center text-sm text-green-500 dark:text-green-400">{success}</p>
            )}
            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        className="text-black"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                    />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        className="text-black"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        type="password"
                    />
                </LabelInputContainer>

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    disabled={isLoading || !userId || !secret}
                >
                    Reset Password &rarr;
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

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
