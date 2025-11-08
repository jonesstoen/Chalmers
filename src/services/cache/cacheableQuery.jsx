import {useEffect} from 'react'
import {
    useCacheableSection,
    CacheableSection,
    useDhis2ConnectionStatus,
    useDataQuery,
} from "@dhis2/app-runtime"

// 18 hours in milliseconds
const HOURS_18 = 18 * 60 * 60 * 1000

export function useCacheableQuery(sectionName, query, options = {}) {
    const {isConnected} = useDhis2ConnectionStatus()
    const {
        startRecording,
        isRecording,
        isCached,
        lastUpdated
    } = useCacheableSection(sectionName)

    // compares lastUpdated to now, and checks if the difference is larger than 18 hours or not
    const isCacheFresh = (() => {
        if (!lastUpdated) return false
        const ageMs = Date.now() - new Date(lastUpdated).getTime()
        return ageMs <= HOURS_18
    })()

    useEffect(() => {
        if (isConnected && (!isCached || !isCacheFresh) && !isRecording) {
            void startRecording()
        }
    }, [isConnected, isCached, isRecording, isCacheFresh, startRecording])

    // Only fetch online if cache is stale or missing
    const shouldFetchOnline = isConnected && (!isCacheFresh || !isCached)

    const queryState = useDataQuery(query, {
        ...options,
        lazy: !shouldFetchOnline, // prevent auto-fetch if cache is fresh
    })

    // If we’re using cached data, trigger refetch to load it from the service worker
    useEffect(() => {
        if (!shouldFetchOnline && queryState.refetch) {
            void queryState.refetch()
        }
    }, [shouldFetchOnline])

    return {
        ...queryState,
        isConnected,
        isCached,
        lastUpdated,
        sectionName
    }
}

export const CacheableQuerySection = ({ id, children, loadingMask }) => (
    <CacheableSection id={id} loadingMask={loadingMask}>
        {children}
    </CacheableSection>
)