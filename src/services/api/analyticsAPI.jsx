import { useDataQuery } from '@dhis2/app-runtime'


// Bp3y61WbHwn Kanfiig id
// RlPlK44dtoo Banjul id
// GET /api/analytics/dataValueSet.json?dataSet=YOUR_DATASET_UID&period=202401&orgUnit=YOUR_ORGUNIT_UID
function fetchAnalytics(data_id,date,org_id){

    const query = {
        // TODO
        data : {
            resource: 'analytics/dataValueSet.json',
            params: {
                dimension: [],
            }
        }
    }

return useDataQuery(query)
}

export default fetchAnalytics