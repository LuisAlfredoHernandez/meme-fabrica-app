"use client";

import { useEffect } from "react";

export function PWARegister() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const handleRegister = () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((reg) => {
                        console.log("[PWA] Service Worker registrado con éxito. Scope:", reg.scope);
                    })
                    .catch((err) => {
                        console.error("[PWA] Error al registrar el Service Worker:", err);
                    });
            };

            if (document.readyState === "complete") {
                handleRegister();
            } else {
                window.addEventListener("load", handleRegister);
                return () => window.removeEventListener("load", handleRegister);
            }
        }
    }, []);

    return null;
}
