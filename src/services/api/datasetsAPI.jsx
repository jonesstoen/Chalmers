import { useDataQuery } from '@dhis2/app-runtime'


// Bp3y61WbHwn Kanfiig id
// RlPlK44dtoo Banjul id
//
function fetchDatasets(){

    const query = {
        dataSets: {
            resource: 'dataSets'
        },
    }

return useDataQuery(query)
}

export default fetchDatasets