import { useDataQuery } from '@dhis2/app-runtime'



// https://docs.dhis2.org/archive/en/2.25/developer/html/webapi_event_analytics.html
// Template GET /api/analytics/events/query/<program-id>?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd&dimension=ou:<ou-id>;<ou-id>&dimension=<item-id>&dimension=<item-id>:<operator>:<filter>
// Example using the school inspection program and Banjul:
// GET /api/analytics/events/query/UxK2o06ScIe?dimension=ou:RlPlK44dtoo



// filter should be an array of objects in the form {itemid, operator, filter}.
// Example: [{ itemid: 'deID1', operator: 'GT', filter: '10' }]
function useFetchAnalytics(program_id, {startDate, endDate} = {}, filter = [], org_id_array = []){ 

    // Listening to changes to these variables
    const variables = {startDate, endDate, filter, org_id_array}

    const query = {
        analytics: {
            resource: `api/analytics/events/query/${program_id}`,
            params: ({startDate, endDate, filter, org_id_array}) => {
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
                return params
            }
        },
    }


    return useDataQuery(query,{ variables })
}

export default useFetchAnalytics