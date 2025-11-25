import { useEffect, useMemo, useState, useRef } from "react"
import { useDataQuery } from "@dhis2/app-runtime"
import { dataCache, outboxCache } from "./config"
import { useOfflineDetector } from "./useOfflineDetector"
import { useBypassLocalhostOfflineDetector } from "./useBypassLocalhostOfflineDetector"

export function useCacheableQuery(
    cacheKey,
    dataKey,
    query,
    variables = {},
    forceLazy = false
) {
    // Singletons from config
    const cacheMap = {
        data: dataCache,
        outbox: outboxCache,
    }

    // This is safe if cacheMap values are stable top-level instances
    const cache = useMemo(() => cacheMap[cacheKey], [cacheKey])

    // Check online status
    const isOffline1 = useOfflineDetector()
    const isOffline2 = useBypassLocalhostOfflineDetector()
    const isOffline = isOffline1 || isOffline2
    const isOnline = !isOffline

    const [cachedData, setCachedData] = useState(null)
    const [cacheStatus, setCacheStatus] = useState("none")
    const [cacheChecked, setCacheChecked] = useState(false)
    const [initialLazy, setInitialLazy] = useState(true) // prevents oscillation
    const prevOnlineRef = useRef(isOnline) // Track previous online state


    useEffect(() => {
        let cancelled = false

        setCacheChecked(false)

        ;(async () => {
            const item = await cache.getItem(dataKey)

            if (cancelled) return

            if (item?.value != null) {
                const stale = isCacheStale(item.timestamp)
                setCachedData(item.value)
                setCacheStatus(stale ? "stale-cache" : "cache")
            } else {
                setCachedData(null)
                setCacheStatus("none")
            }

            setCacheChecked(true)
        })()

        return () => {
            cancelled = true
        }
    }, [dataKey, cache])

    const { data: networkData, loading, error, refetch } = useDataQuery(query, {
        variables,
        lazy: initialLazy || forceLazy,
    })

    // Stop lazy once cache has been evaluated
    useEffect(() => {
        if (cacheChecked && !forceLazy) {
            setInitialLazy(false)
        }
    }, [cacheChecked, forceLazy])


    useEffect(() => {
        if (!cacheChecked) return
        if (forceLazy) return
        
        const justCameOnline = isOnline && !prevOnlineRef.current
        
        // If were online, always fetch to get fresh data (even if cache exists)
        // This ensures the cache is repopulated with latest data from the database
        if (isOnline) {
            // refetch if:
            // we just came online (transition from offline to online), OR
            // we don't have network data yet (initial fetch after cache check)
            if (justCameOnline || !networkData) {
                refetch()
            }
        } else if (cachedData == null) {
            // Only fetch if offline and no cache exists
            refetch()
        }
        
        // Update previous online state
        prevOnlineRef.current = isOnline
    }, [cacheChecked, isOnline, forceLazy, networkData])


    // WRITE NETWORK DATA TO CACHE

    useEffect(() => {
        if (!networkData) return

            ;(async () => {
            await cache.setItem(dataKey, {
                value: networkData,
                timestamp: Date.now(),
            })

            setCachedData(networkData)
            setCacheStatus("network")
        })()
    }, [networkData, dataKey, cache])

    return {
        data: networkData || cachedData,
        loading,
        error,
        refetch,
        source: cacheStatus,
    }
}

function isCacheStale(timestamp) {
    return Date.now() - timestamp > 16 * 60 * 60 * 1000
}
