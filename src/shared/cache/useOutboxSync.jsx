import { useEffect, useRef } from "react"
import { outboxCache } from "./config"
import { useDataMutation } from "@dhis2/app-runtime"
import { useOfflineDetector } from "./useOfflineDetector"
import { useBypassLocalhostOfflineDetector } from "./useBypassLocalhostOfflineDetector"

const TRACKER_MUTATION = {
    resource: "tracker",
    type: "create",
    params: {
        async: false,
        importStrategy: "CREATE",
    },
    data: ({ events }) => ({ events }),
}

export function useOutboxSync(intervalMs = 4000) {
    const isOffline1 = useOfflineDetector()
    const isOffline2 = useBypassLocalhostOfflineDetector()
    const isOffline = isOffline1 || isOffline2

    const [mutate] = useDataMutation(TRACKER_MUTATION)

    // ref to avoid simultaneous operations
    const syncingRef = useRef(false)

    useEffect(() => {
        if (syncingRef.current) return

        const timer = setInterval(async () => {
            if (isOffline) {
                // Still offline, cannot sync
                return
            }

            if (syncingRef.current) return
            syncingRef.current = true

            try {
                const keys = await outboxCache.keys()
                const eventKeys = keys.filter(key => key.startsWith("event:"))

                if (eventKeys.length === 0) {
                    syncingRef.current = false
                    return
                }

                // process OLDEST item first (stable FIFO behavior)
                eventKeys.sort((a, b) => a.localeCompare(b))

                const key = eventKeys[0]
                const item = await outboxCache.getItem(key)

                console.log("🔄 Attempting to sync:", key, item)

                if (!item || !item.events) {
                    console.warn("❓ Malformed outbox item removed:", key)
                    await outboxCache.removeItem(key)
                    syncingRef.current = false
                    return
                }

                try {
                    const result = await mutate({ events: item.events })

                    console.log("Synced successfully:", key, result)
                    await outboxCache.removeItem(key)
                } catch (err) {
                    console.warn("Failed syncing:", err)

                    if (
                        err?.type === "network" ||
                        err?.message?.includes("Network") ||
                        err?.message?.includes("Failed to fetch")
                    ) {
                        console.warn("📡 Network error during sync — stopping sync loop.")
                        syncingRef.current = false
                        return
                    }

                    console.error("🚫 Server rejected event. Removing from queue:", key)
                    await outboxCache.removeItem(key)
                }

            } finally {
                syncingRef.current = false
            }
        }, intervalMs)

        return () => clearInterval(timer)
    }, [isOffline, mutate, intervalMs])
}
