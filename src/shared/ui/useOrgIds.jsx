import useFetchOrgUnits from "../../features/org-units/api/organisationAPI"

function useOrgIds(ordID_array){
    const orgUnits = useFetchOrgUnits(ordID_array)

    return orgUnits
}

export default useOrgIds