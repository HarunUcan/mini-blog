"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken } from "@/lib/auth";

type AuthGuardProps = {
    children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let active = true;

        const checkSession = async () => {
            const ok = await ensureAccessToken();
            if (!active) return;

            if (!ok) {
                router.replace("/login");
                return;
            }

            setIsReady(true);
        };

        checkSession();

        return () => {
            active = false;
        };
    }, [router]);

    if (!isReady) {
        return (
            <div className="px-4 md:px-8 lg:px-30 py-16 text-center text-gray-400">
                Checking session...
            </div>
        );
    }

    return <>{children}</>;
}
