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
    const dataKey = orgIds.join(",")
    // Bygg dimensjoner stabilt
    const dimensions = useMemo(() => {
        const d = []
        if (orgIds?.length) d.push(`ou:${orgIds.join(';')}`)
        for (const f of filter) {
            if (f?.itemid && f?.operator && f?.filter != null) {
                d.push(`${f.itemid}:${f.operator}:${f.filter}`)
            }
        }
        return d
    }, [orgIds, JSON.stringify(filter)])

    // ÉN statisk query (ingen deps)
    const query = useMemo(() => ({
        analytics: {
            resource: 'analytics/events/query',
            id: ({ program }) => program, // -> /analytics/events/query/{programId}
            params: ({ dimensions, startDate, endDate, stage, descendants, paging }) => ({
                ...(dimensions?.length ? { dimension: dimensions } : {}),
                ...(startDate && endDate ? { startDate, endDate } : {}),
                ...(stage ? { stage } : {}),
                ...(descendants ? { ouMode: 'DESCENDANTS' } : {}),
                paging
            }),
        },
    }), [])

    return useCacheableQuery(
        'events',
        dataKey,
        query,
        {program: programId, dimensions, startDate, endDate, stage, descendants, paging}
    )
    /*
    return useDataQuery(query, {
        lazy: !programId,
        variables: { program: programId, dimensions, startDate, endDate, stage, descendants, paging },
    })

     */
}