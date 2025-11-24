import { useEffect, useMemo, useState } from "react"
import { useDataQuery } from "@dhis2/app-runtime"
import { dataCache, outboxCache } from "./config"

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

    const [cachedData, setCachedData] = useState(null)
    const [cacheStatus, setCacheStatus] = useState("none")
    const [cacheChecked, setCacheChecked] = useState(false)
    const [initialLazy, setInitialLazy] = useState(true) // prevents oscillation

    //
    // 1. READ CACHE
    //
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

    //
    // 2. NETWORK QUERY (lazy only until cache checked)
    //
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

    //
    // 3. REFETCH IF CACHE EMPTY (only after cache check)
    //
    useEffect(() => {
        if (!cacheChecked) return
        if (forceLazy) return
        if (cachedData != null) return

        // IMPORTANT: refetch is stable enough to call,
        // but not stable enough to include in the deps
        refetch()
    }, [cacheChecked, cachedData, forceLazy])

    //
    // 4. WRITE NETWORK DATA TO CACHE
    //
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
