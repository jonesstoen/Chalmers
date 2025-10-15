import { useDataQuery } from '@dhis2/app-runtime'

// Bp3y61WbHwn Kanfiig id
// RlPlK44dtoo Banjul id
// Hardcoded both for now 
// They are under organisationunits in the GET <baseurl>:/api/me 
function useGetClusters(){

    const query = {
        Kanifing : {
            resource: 'organisationUnits/Bp3y61WbHwn',
            params: {
                fields: ['children','parents','name','programs','dataSets']
            }
        },

        Banjul : {
            resource: 'organisationUnits/RlPlK44dtoo',
            params: {
                fields: ['children','parents','name','programs','dataSets']
            }
        }
    }

    return useDataQuery(query)
}


export default useGetClusters