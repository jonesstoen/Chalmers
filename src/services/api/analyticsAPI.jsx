// services/api/analyticsAPI.jsx
import { useMemo } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'

/**
 * useFetchAnalytics
 * - Lager et STABILT query-objekt (useMemo)
 * - Bruker variables for programId + params
 * - Kaller ikke API før programId finnes (lazy)
 *
 * filter: [{ itemid, operator, filter }]
 * orgIds: string[] (ou ids)
 */
export default function useFetchAnalytics(
    programId,
    { startDate, endDate, stage } = {},
    filter = [],
    orgIds = [],
    /* isAggregate not used in params, men behold hvis du vil utvide */ _isAggregate
) {
    // Bygg dimensions én gang pr. endring i inputs
    const dims = useMemo(() => {
        const d = []
        if (orgIds?.length) d.push(`ou:${orgIds.join(';')}`)
        if (stage) d.push(`stage:${stage}`)
        for (const f of filter) {
            if (f?.itemid && f?.operator && f?.filter != null) {
                d.push(`${f.itemid}:${f.operator}:${f.filter}`)
            }
        }
        return d
    }, [orgIds, stage, JSON.stringify(filter)])

    // Stabile query  i got an error that every render was creating a new query object
    const query = useMemo(
        () => ({
            analytics: {
                resource: 'analytics/events/query',
                // programId som "id" del av pathen
                id: ({ program }) => program,
                // params kan også bruke variables
                params: ({ dims, startDate, endDate }) => ({
                    ...(dims?.length ? { dimension: dims } : {}),
                    ...(startDate && endDate ? { startDate, endDate } : {}),
                }),
            },
        }),
        []
    )

    // Kjør kun når programId finnes
    return useDataQuery(query, {
        lazy: !programId,
        variables: {
            program: programId,
            dims,
            startDate,
            endDate,
        },
    })
}