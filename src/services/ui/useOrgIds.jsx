import { useDhis2ConnectionStatus } from "@dhis2/app-runtime"
import useFetchOrgUnits from "../api/organisationAPI"

function useOrgIds(ordID_array){
    const { isConnected, isDisconnected, lastConnected } = useDhis2ConnectionStatus()
    const online = useFetchOrgUnits(ordID_array)
    const offline = useOfflineFetchOrgUnits(ordID_array)

    if(isDisconnected){
        return offline
    }else{

        // Caching policy here
        
        return online
    }
}

export default useOrgIds