"use client";

import Input from "@/components/Input";
import GuestGuard from "@/components/GuestGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "@/lib/auth";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email: email.trim(), password });
            router.replace("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GuestGuard>
            <div className="w-full flex min-h-screen flex-col items-center justify-center dark:bg-gray-900 px-6">
                <div className="flex flex-col justify-center items-center w-3/5 h-auto py-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome Back</h1>
                        <span className="mt-2 text-gray-600 dark:text-gray-400">Sign in to manage your blog.</span>
                    </div>

                    <div className="flex flex-col justify-center items-center w-full">
                        <form className="w-full mt-6 flex flex-col items-center justify-center gap-4" onSubmit={handleSubmit}>

                            <Input
                                label="Email Address"
                                id="email"
                                placeholder="Email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                disabled={isSubmitting}
                                aria-invalid={Boolean(error)}
                            />

                            <Input
                                label="Password"
                                id="password"
                                placeholder="Password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                disabled={isSubmitting}
                                aria-invalid={Boolean(error)}
                            />

                            <button
                                type="submit"
                                className="w-1/2 bg-black text-gray-200 py-2 rounded-md hover:bg-gray-950 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Signing in..." : "Log In"}
                            </button>

                            {error && (
                                <p className="w-3/4 text-sm text-red-600 text-center" role="alert">
                                    {error}
                                </p>
                            )}
                        </form>

                        <div className="flex justify-center items-center w-1/2">
                            <hr className="h-px w-2/5 mx-auto mt-8 bg-gray-300 dark:bg-gray-400 border-0"></hr>
                            <span className="mx-4 mt-8 text-gray-500 dark:text-gray-400">or</span>
                            <hr className="h-px w-2/5 mx-auto mt-8 bg-gray-300 dark:bg-gray-400 border-0"></hr>
                        </div>

                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuestGuard>
    );
}
