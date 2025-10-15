import { useDataQuery } from '@dhis2/app-runtime'


// https://research.im.dhis2.org/in5320g09/api/organisationUnits.json?filter=path:like:<CLUSTER_ID>&filter=organisationUnitGroups.id:eq:<UNIT_GROUP_ID>&fields=id,name,level,parent[id,name,level]&paging=false
function useFetchSchools(school_id_array){

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


 

export default useFetchSchools