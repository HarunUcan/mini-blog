import Input from "@/components/Input";
import Link from "next/link";

export default function Register() {
    return (
        <div className="w-full flex min-h-screen flex-col items-center justify-center dark:bg-gray-900 px-6">
            <div className="flex flex-col justify-center items-center w-3/5 h-auto py-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome Back</h1>
                    <span className="mt-2 text-gray-600 dark:text-gray-400">Sign in to manage your blog.</span>
                </div>

                <div className="flex flex-col justify-center items-center w-full">
                    <form className="w-full mt-6 flex flex-col items-center justify-center gap-4">

                        <Input label="Email Address" id="email" placeholder="Email" type="email" />

                        <Input label="Password" id="password" placeholder="Password" type="password" />

                        <button
                            type="submit"
                            className="w-1/2 bg-black text-gray-200 py-2 rounded-md hover:bg-gray-950 transition-colors cursor-pointer"
                        >
                            Log In
                        </button>
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
    );
}