import {useEffect, useState} from 'react'
import {
    useDhis2ConnectionStatus,
    useDataQuery,
} from "@dhis2/app-runtime"
import {aggregatedCache, eventsCache, outboxCache} from "./config";


// 18 hours in milliseconds
const HOURS_18 = 18 * 60 * 60 * 1000

export function useCacheableQuery(cacheKey, dataKey, query, options = {}) {
    const {isConnected} = useDhis2ConnectionStatus()
    const cacheMap = {
        events: eventsCache,
        aggregated: aggregatedCache,
        outbox: outboxCache
    }
    const cache = cacheMap[cacheKey]

    const [data, setData] = useState(null)
    const [isFresh, setIsFresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { data: onlineData, refetch, loading: onlineLoading, error: onlineError } =
        useDataQuery(query, options)

    useEffect(() => {
        let isMounted = true

        async function fetchData() {
            setLoading(true)

            if (!cache) {
                console.error(`Unknown cache key: ${cacheKey}`)
                setLoading(false)
                return
            }

            try {
                if (isConnected) {
                    if (onlineData) {
                        await cache.setItem(dataKey, {
                            data: onlineData,
                            lastUpdated: Date.now()
                        })
                        if (isMounted) {
                            setData(onlineData)
                            setIsFresh(true)
                        }
                    }
                } else {
                    const cached = await cache.getItem(dataKey)
                    if (cached) {
                        const age = Date.now() - cached.lastUpdated
                        const fresh = age <= HOURS_18
                        if (isMounted) {
                            setData(cached.data)
                            setIsFresh(fresh)
                        }
                    } else {
                        if (isMounted) setError('No connection and no cached data found')
                    }
                }
            } catch (error) {
                if (isMounted) setError(error)
            } finally {
                if  (isMounted) setLoading(false)
            }
        }

        fetchData()

        return () => {
            isMounted = false
        }
    }, [isConnected, onlineData, cacheKey, dataKey])

    return {
        data,
        loading: isConnected ? onlineLoading || loading : loading,
        error: onlineError || error,
        refetch,
        isFresh,
        isConnected,
    }
}