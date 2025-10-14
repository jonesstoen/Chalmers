import { useDataQuery } from '@dhis2/app-runtime'

function fetchOrganisation(ID /*String */){
    const query = {
        organisation : {
            resource: ID
        }
    }

    return useDataQuery(query)
}


export default fetchOrganisation