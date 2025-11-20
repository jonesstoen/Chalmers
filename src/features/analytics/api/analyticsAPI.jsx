// services/api/analyticsAPI.jsx
import { useMemo } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import {useCacheableQuery} from "../../../shared/cache/cacheableQuery";

export default function useFetchAnalytics(
    programId,
    { startDate, endDate, stage } = {},
    filter = [],
    orgIds = [],
    { descendants = false, paging = false } = {}
) {
    // Memoize dimensions
    const dimensions = useMemo(() => {
        const d = []

        if (orgIds?.length) {
            d.push(`ou:${orgIds.join(";")}`)
        }

        for (const f of filter) {
            if (f?.itemid && f?.operator && f?.filter != null) {
                d.push(`${f.itemid}:${f.operator}:${f.filter}`)
            }
        }

        return d
    }, [orgIds, filter]) // <-- filter is already stable (don’t stringify!)

    // memoize dataKey
    const dataKey = useMemo(
        () =>
            JSON.stringify({
                programId,
                orgIds,
                startDate,
                stage,
                filter,
                descendants,
                paging,
                dimensions,
            }),
        [programId, orgIds, startDate, stage, filter, descendants, paging, dimensions]
    )

    // Memoizing query object
    const query = useMemo(() => ({
        analytics: {
            resource: 'analytics/events/query',
            id: ({ program }) => program,
            params: ({
                    dimensions,
                    startDate,
                    endDate,
                    stage,
                    descendants,
                    paging,
                    }) => ({
                ...(dimensions?.length ? { dimension: dimensions } : {}),
                ...(startDate && endDate ? { startDate, endDate } : {}),
                ...(stage ? { stage } : {}),
                ...(descendants ? { ouMode: 'DESCENDANTS' } : {}),
                paging,
            }),
        },
    }), [])

    // ---- 4. Use cacheable query ----
    return useCacheableQuery(
        'data',
        dataKey,
        query,
        {
            program: programId,
            dimensions,
            startDate,
            endDate,
            stage,
            descendants,
            paging,
        }
    )
}