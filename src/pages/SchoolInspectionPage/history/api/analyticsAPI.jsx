import { useMemo } from 'react'
import {useCacheableQuery} from "../../../../shared/cache/cacheableQuery";

const EVENTS_ANALYTICS_QUERY = {
    analytics: {
        resource: "analytics/events/query",
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
            ...(descendants ? { ouMode: "DESCENDANTS" } : {}),
            paging,
        }),
    },
}

export default function useFetchAnalytics(
    programId,
    { startDate, endDate, stage } = {},
    filter = [],
    orgIds = [],
    { descendants = false, paging = false } = {}
) {
    const dimensions = useMemo(() => {
        const d = []
        if (orgIds?.length) d.push(`ou:${orgIds.join(";")}`)
        for (const f of filter) {
            if (f?.itemid && f?.operator && f?.filter != null) {
                d.push(`${f.itemid}:${f.operator}:${f.filter}`)
            }
        }
        return d
    }, [orgIds, filter])

    const variables = useMemo(
        () => ({
            program: programId,
            dimensions,
            startDate,
            endDate,
            stage,
            descendants,
            paging,
        }),
        [programId, dimensions, startDate, endDate, stage, descendants, paging]
    )

    const dataKey = useMemo(
        () =>
            JSON.stringify({
                type: "fetchAnalytics",
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

    return useCacheableQuery(
        "data",
        dataKey,
        EVENTS_ANALYTICS_QUERY,
        variables
    )
}