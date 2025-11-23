import useFetchOrgUnits from "../../pages/SchoolInspectionPage/api/useFetchOrgUnits"

function useOrgIds(ordID_array){
    const orgUnits = useFetchOrgUnits(ordID_array)

    return orgUnits
}

export default useOrgIds