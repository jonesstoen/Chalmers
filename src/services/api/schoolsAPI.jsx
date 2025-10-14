import { useDataQuery } from '@dhis2/app-runtime'


function fetchSchools(school_id_array){

const query = school_id_array.reduce(

    (acc,school_id) => {
    acc[school_id] = {
            resource: `organisationUnits/${school_id}`,
            params: {
                fields: ['*'] // The fields we want programs, datasets etc
                }
        }
    }
,{}) 

return useDataQuery(query)
}


 

export default fetchSchools