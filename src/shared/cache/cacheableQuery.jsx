import { useEffect, useMemo, useState } from "react";
import { useDhis2ConnectionStatus, useDataQuery } from "@dhis2/app-runtime";
import { aggregatedCache, eventsCache, outboxCache } from "./config";

export function useCacheableQuery(cacheKey, dataKey, query, options = {}) {
    const cacheMap = {
        events: eventsCache,
        aggregated: aggregatedCache,
        outbox: outboxCache,
    };

    // memoize chosen cache instance
    const cache = useMemo(() => cacheMap[cacheKey], [cacheKey]);

    const [cachedData, setCachedData] = useState(null);
    const [cacheStatus, setCacheStatus] = useState("none");
    // "none" | "cache" | "stale-cache" | "network"

    // --- 1. Load cache on mount / dataKey change
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        (async () => {
            try {
                const item = await cache.getItem(dataKey);
                if (signal.aborted) return;
                if (item) {
                    const isStale = isCacheStale(item.timestamp);
                    setCachedData(item.value);
                    setCacheStatus(isStale ? "stale-cache" : "cache");
                } else {
                    setCacheStatus("none");
                    setCachedData(null);
                }
            } catch (e) {
                // ignore read errors for now
            }
        })();

        return () => controller.abort();
    }, [dataKey, cache]);

    // decide whether to run the network query:
    const shouldFetchFromNetwork = !cachedData || cacheStatus === "stale-cache";

    // --- 2. Run DHIS2 network query (lazy when we have a fresh cache)
    const { data, loading, error } = useDataQuery(query, {
        variables: options,
        lazy: !shouldFetchFromNetwork,
    });

    // --- 3. When network fetch succeeds → update cache (but avoid redundant writes)
    useEffect(() => {
        if (!data) return;

        const controller = new AbortController();
        const { signal } = controller;

        (async () => {
            try {
                // Avoid repeated writes if the cached value already matches network data
                if (cachedData && deepEqual(cachedData, data)) {
                    if (signal.aborted) return;
                    // only change status if it's not already "network" to avoid extra renders
                    setCacheStatus((prev) => (prev === "network" ? prev : "network"));
                    // don't call setCachedData(data) here — avoid changing reference when value is equal
                    return;
                }

                await cache.setItem(dataKey, {
                    value: data,
                    timestamp: Date.now(),
                });

                if (signal.aborted) return;

                setCacheStatus("network");
                setCachedData(data);
            } catch (e) {
                // ignore write errors
            }
        })();

        return () => controller.abort();
    }, [data, dataKey, cache, cachedData, cacheStatus]);

    // --- 4. If network fails → fall back to cache
    const finalData = error && cachedData ? cachedData : data || cachedData;

    const finalStatus = (() => {
        if (data) return "network";
        if (error && cachedData) return cacheStatus;
        return cacheStatus;
    })();

    return {
        data: finalData,
        loading,
        error,
        source: finalStatus,
    };
}

// Example: stale after ~16h
function isCacheStale(time) {
    return Date.now() - time > 16 * 60 * 60 * 1000;
}

function deepEqual(a, b) {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}