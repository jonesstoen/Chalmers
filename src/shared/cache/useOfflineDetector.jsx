import { useState, useEffect } from "react"
import { useDhis2ConnectionStatus, useOnlineStatus } from "@dhis2/app-runtime"

export function useOfflineDetector() {
    const browserOnline = navigator.onLine;
    const { isConnected } = useDhis2ConnectionStatus();
    const [serverReachable, setServerReachable] = useState(true);

    useEffect(() => {
        let timeout = setTimeout(async () => {
            try {
                // real test to the server
                const res = await fetch("/api/me", { method: "GET" });

                setServerReachable(res.ok);
            } catch {
                setServerReachable(false);
            }
        }, 150);
        return () => clearTimeout(timeout);
    });

    // Must be reachable, connected, and browser online
    return !(browserOnline && isConnected && serverReachable);
}