import { useEffect, useMemo, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { dataCache, outboxCache } from "./config";

export function useCacheableQuery(
    cacheKey,
    dataKey,
    query,
    variables = {},
    forceLazy = false
) {
    const cacheMap = {
        data: dataCache,
        outbox: outboxCache,
    };

    // Stable cache instance
    const cache = useMemo(() => cacheMap[cacheKey], [cacheKey]);

    const [cachedData, setCachedData] = useState(null);
    const [cacheStatus, setCacheStatus] = useState("none");
    const [cacheChecked, setCacheChecked] = useState(false);
    // "none" | "cache" | "stale-cache" | "network"

    // ---- 1. Load cache when dataKey changes ----
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setCacheChecked(false); // Reset check status when dataKey changes
            
            const item = await cache.getItem(dataKey);

            if (cancelled) return;

            if (item && item.value != null) {
                // Only use cache if it has actual data (not null/undefined)
                const stale = isCacheStale(item.timestamp);
                setCachedData(item.value);
                setCacheStatus(stale ? "stale-cache" : "cache");
            } else {
                // No cache or cache has null/undefined - need to fetch
                setCachedData(null);
                setCacheStatus("none");
            }
            
            setCacheChecked(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [dataKey, cache]);

    // Should we query the network?
    // Strategy: Start lazy, then refetch if needed after cache check
    // If forceLazy is true, always lazy (skip query)
    // Otherwise: Start lazy, then check cache - if no cache, we'll refetch
    const willBeLazy = forceLazy || !cacheChecked

    // ---- 2. DHIS2 network query ----
    // Start lazy, then refetch if no cache after cache check completes
    const {
        data: networkData,
        loading,
        error,
        refetch,
    } = useDataQuery(query, {
        variables,
        lazy: willBeLazy,
    });

    // ---- 2b. After cache check, refetch if no cache and not forceLazy ----
    useEffect(() => {
        if (!cacheChecked) return; // Wait for cache check
        if (forceLazy) return; // Don't fetch if forced lazy
        if (cachedData != null) return; // Have cache, don't fetch
        if (networkData) return; // Already have network data
        
        // No cache found, trigger fetch
        refetch();
    }, [cacheChecked, forceLazy, cachedData, networkData, refetch]);

    // ---- 3. When network returns valid data, update cache ----
    useEffect(() => {
        if (!networkData) return;

        let cancelled = false;

        (async () => {
            if (!deepEqual(networkData, cachedData)) {
                await cache.setItem(dataKey, {
                    value: networkData,
                    timestamp: Date.now(),
                });
            }

            if (cancelled) return;

            setCachedData(networkData);
            setCacheStatus("network");
        })();

        return () => {
            cancelled = true;
        };
    }, [networkData, dataKey, cache]);

    // ---- 4. Choose final result ----
    const finalData = networkData || cachedData;

    return {
        data: finalData,
        loading,
        error,
        refetch,
        source: cacheStatus,
    };
}

// ~16 hours stale
function isCacheStale(timestamp) {
    return Date.now() - timestamp > 16 * 60 * 60 * 1000;
}

function deepEqual(a, b) {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}
