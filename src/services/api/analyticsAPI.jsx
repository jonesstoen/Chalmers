import { useDataQuery } from '@dhis2/app-runtime'


// Bp3y61WbHwn Kanfiig id
// RlPlK44dtoo Banjul id
// school ids are children of the clusters
// Example GET /api/analytics/dataValueSet.json?dataSet=YOUR_DATASET_UID&period=202401&orgUnit=YOUR_ORGUNIT_UID
function useFetchAnalytics(data_id,date,org_id){

    const query = {
        // TODO
        data : {
            resource: 'analytics/dataValueSet.json',
            params: {
                dimension: [/*PARAMS*/],
            }
        }
    }

return useDataQuery(query)
}

export default useFetchAnalytics