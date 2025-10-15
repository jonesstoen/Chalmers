import { useDataQuery } from '@dhis2/app-runtime'

// https://research.im.dhis2.org/in5320g09/api/dataSets/x0V4c4DxJHE?fields=dataSetElements[dataElement[id,name,domainType,valueType]]
// Baseline survey data that we will use for reference exists for up to 2024 and can be found in the “EMIS - Primary Tool” data set (uid x0V4c4DxJHE)
function fetchDatasets(){

    const query = {
        dataSets: {
            resource: 'dataSets',
            params: {
                fields: ['*']
            }
        },
    }

return useDataQuery(query)
}

export default fetchDatasets