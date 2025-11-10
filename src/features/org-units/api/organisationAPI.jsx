import { useDataQuery } from '@dhis2/app-runtime'


// https://research.im.dhis2.org/in5320g09/api/organisationUnits.json?filter=path:like:<CLUSTER_ID>&filter=organisationUnitGroups.id:eq:<UNIT_GROUP_ID>&fields=id,name,level,parent[id,name,level]&paging=false
function useFetchOrgUnits(org_id_array){

const query = org_id_array.reduce(

    (acc,org_id) => {
    acc[org_id] = {
            resource: `organisationUnits/${org_id}`,
            params: {
                fields: ['children[name,id]','parents[name,id]','name','id','programs[name,id]','dataSets[name,id]']
            }
        }
        return acc
    }
    ,{}) 

return useDataQuery(query)
}


 

export default useFetchOrgUnits