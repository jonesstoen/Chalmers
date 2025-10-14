import { useDataQuery } from '@dhis2/app-runtime'


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