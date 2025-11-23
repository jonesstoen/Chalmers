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

    const cache = useMemo(() => cacheMap[cacheKey], [cacheKey]);

    const [cachedData, setCachedData] = useState(null);
    const [cacheStatus, setCacheStatus] = useState("none");
    const [cacheChecked, setCacheChecked] = useState(false);
    // Status: "none" | "cache" | "stale-cache" | "network"

    // Check cache when dataKey changes
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setCacheChecked(false);
            
            const item = await cache.getItem(dataKey);

            if (cancelled) return;

            if (item && item.value != null) {
                const stale = isCacheStale(item.timestamp);
                setCachedData(item.value);
                setCacheStatus(stale ? "stale-cache" : "cache");
            } else {
                setCachedData(null);
                setCacheStatus("none");
            }
            
            setCacheChecked(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [dataKey, cache]);

    // Start query lazy, then fetch if no cache
    const willBeLazy = forceLazy || !cacheChecked

    const {
        data: networkData,
        loading,
        error,
        refetch,
    } = useDataQuery(query, {
        variables,
        lazy: willBeLazy,
    });

    // After cache check: if no cache and not forced lazy, fetch from network
    useEffect(() => {
        if (!cacheChecked) return;
        if (forceLazy) return;
        if (cachedData != null) return;
        if (networkData) return;
        
        refetch();
    }, [cacheChecked, forceLazy, cachedData, networkData, refetch]);

    // When network data arrives, save to cache
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

    // Return network data if available, otherwise cached data
    const finalData = networkData || cachedData;

    return {
        data: finalData,
        loading,
        error,
        refetch,
        source: cacheStatus,
    };
}

// Cache is stale after 16 hours
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
