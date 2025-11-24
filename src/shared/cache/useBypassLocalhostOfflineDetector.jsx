import {useEffect, useState} from "react";

export function useBypassLocalhostOfflineDetector() {
    const [reallyOffline, setReallyOffline] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            try {
                // Query an external IP (cloudflare); fails *instantly* when offline
                await fetch("https://1.1.1.1", { mode: "no-cors" });

                if (!cancelled) setReallyOffline(false);
            } catch {
                if (!cancelled) setReallyOffline(true);
            }
        }

        check();

        // Recheck every 2 sec
        const id = setInterval(check, 2000);

        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    return reallyOffline;
}