import { useMemo } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'

function useFetchAnalytics(
    program_id,
    { startDate, endDate, stage } = {},
    filter = [],
    org_id_array = [],
    isAggregate = false
) {
    // Don't run if program_id is missing (prevents query/null)
    if (!program_id) {
        return { data: null, loading: false, error: null }
    }

    // Build dimensions
    const dimensions = []

    if (org_id_array.length > 0) {
        dimensions.push(`ou:${org_id_array.join(';')}`)
    }

    filter.forEach(({ itemid, operator, filter: filterValue }) => {
        dimensions.push(`${itemid}:${operator}:${filterValue}`)
    })

    const params = {
        ...(dimensions.length > 0 && { dimension: dimensions }),
        ...(startDate && endDate && { startDate, endDate }),
        ...(stage && { stage }),
        ...(isAggregate && { ouMode: 'DESCENDANTS' }),
         paging: false,
    }

    // Build query only once for stable inputs
    const query = useMemo(
        () => ({
            analytics: {
                resource: `analytics/events/query/${program_id}`,
                params,
            },
        }),
        [program_id, JSON.stringify(params)]
    )

    // Execute query
    return useDataQuery(query)
}

export default useFetchAnalytics
