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
    // "none" | "cache" | "stale-cache" | "network"

    // ---- 1. Load cache when dataKey changes ----
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const item = await cache.getItem(dataKey);

            if (cancelled) return;

            if (item) {
                const stale = isCacheStale(item.timestamp);
                setCachedData(item.value);
                setCacheStatus(stale ? "stale-cache" : "cache");
            } else {
                setCachedData(null);
                setCacheStatus("none");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [dataKey, cache]);

    // Should we query the network?
    const shouldFetch = cacheStatus === "none" || cacheStatus === "stale-cache";

    // ---- 2. DHIS2 network query ----
    const {
        data: networkData,
        loading,
        error,
        refetch,
    } = useDataQuery(query, {
        variables,
        // NEW LOGIC:
        // forceLazy = guaranteed lazy
        // otherwise lazy only if cache says don't fetch
        lazy: forceLazy || !shouldFetch,
    });

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
