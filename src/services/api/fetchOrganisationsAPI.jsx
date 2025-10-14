import { useDataQuery } from '@dhis2/app-runtime'

// Bp3y61WbHwn Kanfiig id
// RlPlK44dtoo Banjul id
// Hardcoded both for now
function fetchOrganisations(){

    const query = {
        Kanifing : {
            resource: 'organisationUnits/Bp3y61WbHwn',
            params: {
                fields: ['*']
            }
        },

        Banjul : {
            resource: 'organisationUnits/RlPlK44dtoo',
            params: {
                fields: ['*']
            }
        }
    }

    return useDataQuery(query)
}


export default fetchOrganisations