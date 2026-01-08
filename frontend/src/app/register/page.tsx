"use client";

import Input from "@/components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login, register } from "@/lib/auth";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const displayName = `${name} ${surname}`.trim().replace(/\s+/g, " ");
        if (displayName.length < 2) {
            setError("Please enter your full name.");
            return;
        }

        setIsSubmitting(true);

        try {
            const trimmedEmail = email.trim();
            await register({ displayName, email: trimmedEmail, password });
            await login({ email: trimmedEmail, password });
            router.replace("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full flex min-h-screen flex-col items-center justify-center dark:bg-gray-900 px-6">
            <div className="flex flex-col justify-center items-center w-3/5 h-auto py-8 my-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Create Your Account</h1>
                    <span className="mt-2 text-gray-600 dark:text-gray-400">Start your minimal publishing journey today.</span>
                </div>

                <div className="flex flex-col justify-center items-center w-full">
                    <form className="w-full mt-6 flex flex-col items-center justify-center gap-4" onSubmit={handleSubmit}>

                        <Input
                            label="Name"
                            id="name"
                            placeholder="Name"
                            type="text"
                            name="name"
                            autoComplete="given-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(error)}
                        />

                        <Input
                            label="Surname"
                            id="surname"
                            placeholder="Surname"
                            type="text"
                            name="surname"
                            autoComplete="family-name"
                            value={surname}
                            onChange={(event) => setSurname(event.target.value)}
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(error)}
                        />

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
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            minLength={8}
                            disabled={isSubmitting}
                            aria-invalid={Boolean(error)}
                        />



                        <button
                            type="submit"
                            className="w-1/2 bg-black text-gray-200 py-2 rounded-md hover:bg-gray-950 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Account"}
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
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
