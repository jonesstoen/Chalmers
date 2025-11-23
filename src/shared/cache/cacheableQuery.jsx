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

    // Load from cache
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

    const { data: networkData, loading, error, refetch } = useDataQuery(query, {
        variables,
        lazy: forceLazy || !cacheChecked,
    });

    // Fetch if needed
    useEffect(() => {
        if (!cacheChecked) return;
        if (forceLazy) return;
        if (cachedData != null) return;
        if (networkData) return;

        void refetch();
    }, [cacheChecked, cachedData, networkData, forceLazy, refetch]);

    // Write fresh network data to cache
    useEffect(() => {
        if (!networkData) return;

        (async () => {
            await cache.setItem(dataKey, {
                value: networkData,
                timestamp: Date.now(),
            });

            setCachedData(networkData);
            setCacheStatus("network");
        })();
    }, [networkData, dataKey, cache]);

    return {
        data: networkData || cachedData,
        loading,
        error,
        refetch,
        source: cacheStatus,
    };
}

function isCacheStale(timestamp) {
    return Date.now() - timestamp > 16 * 60 * 60 * 1000;
}
