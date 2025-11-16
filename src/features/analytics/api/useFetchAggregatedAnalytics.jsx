import { useEffect, useState, useMemo } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

export default function useFetchAggregatedAnalytics(
    programId,
    {
        startDate,
        endDate,
        stage,
        dimensions: extraDimensions = [],
    } = {},
    filter = [],
    orgIds = [],
    { descendants = false, paging = false } = {}
) {
    const engine = useDataEngine()
    const [state, setState] = useState({ loading: true, error: null, data: null })

    const dimensions = useMemo(() => {
        const d = []
        if (orgIds?.length) d.push(`ou:${orgIds.join(';')}`)
        for (const f of filter) {
            if (f?.itemid && f?.operator && f?.filter != null) {
                d.push(`${f.itemid}:${f.operator}:${f.filter}`)
            }
        }
        if (extraDimensions?.length) d.push(...extraDimensions)
        return d
    }, [orgIds, JSON.stringify(filter), JSON.stringify(extraDimensions)])

    useEffect(() => {
        if (!programId || !stage) return
        setState({ loading: true, error: null, data: null })

        const params = {
            stage,
            startDate,
            endDate,
            paging,
...(dimensions?.length ? { dimension: [...dimensions] } : {}),
            ...(descendants ? { ouMode: 'DESCENDANTS' } : {}),
        }

        console.log('DHIS2 analytics params:', params)

        const query = {
            analytics: {
resource: `analytics/events/query/${programId}`,
                params,
            },
        }
console.log('Params sent:', query.analytics.params)

       engine
    .query(query)
    .then(res => {
        const analytics = res?.analytics ?? res
        console.log('Analytics query result:', analytics)
        setState({ loading: false, error: null, data: analytics })
    })
    .catch(error => {
        console.error('Analytics fetch failed:', error)
        setState({ loading: false, error, data: null })
    })

    }, [engine, programId, stage, startDate, endDate, JSON.stringify(dimensions), descendants, paging])

    return state
}
