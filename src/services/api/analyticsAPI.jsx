


// https://docs.dhis2.org/archive/en/2.25/developer/html/webapi_event_analytics.html
// Template GET /api/analytics/events/query/<program-id>?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd&dimension=ou:<ou-id>;<ou-id>&dimension=<item-id>&dimension=<item-id>:<operator>:<filter>
// Example using the school inspection program and Banjul:
// GET /api/analytics/events/query/UxK2o06ScIe?dimension=ou:RlPlK44dtoo

// | Library                         | Description                                  | Use case                                                |
// | ------------------------------- | -------------------------------------------- | ------------------------------------------------------- |
// | `@dhis2/organisation-unit-tree` | Tree UI for selecting org units              | Select “Region”, “District”, “School” interactively     |
// | `@dhis2/ui-widgets`             | Smaller utilities for filters, pickers, etc. | Reusable filter panels and lists                        |
// | `@dhis2/app-service-datavalue`  | Access aggregated data values                | When fetching analytics from `/api/analytics` endpoints |

// &ouMode=DESCENDANTS Test for å hente ut direkte fra parent
// filter should be an array of objects in the form {itemid, operator, filter}.
// Example: [{ itemid: 'deID1', operator: 'GT', filter: '10' }]
import { useMemo } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'

function useFetchAnalytics(
    program_id,
    { startDate, endDate } = {},
    filter = [],
    org_id_array = []
) {
    // Build dimension parameters
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
    }

    // ✅ Memoized query to satisfy DHIS2 rules
    const query = useMemo(
        () => ({
            analytics: {
                resource: `api/analytics/events/query/${program_id}`,
                params,
            },
        }),
        [program_id, JSON.stringify(params)] // dependency list
    )


    return useDataQuery(query,{ variables })
}

export default useFetchAnalytics
