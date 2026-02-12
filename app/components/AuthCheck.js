"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthCheck({ children }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    const publicRoutes = ["/", "/login", "/signup"];
    const isPublicRoute = publicRoutes.includes(pathname);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user && !isPublicRoute) {
                router.replace("/login");
            }
        }
    }, [user, loading, isPublicRoute, router]);

 
    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#3A1C4A] flex items-center justify-center text-white font-[Marcellus]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#C9A3D9] border-t-transparent rounded-full animate-spin"></div>
                    <p className="animate-pulse">Checking access...</p>
                </div>
            </div>
        );
    }
    if (!user && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}
