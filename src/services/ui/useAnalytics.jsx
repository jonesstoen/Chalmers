import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import useFetchAnalytics from '../api/analyticsAPI'

function useAnalytics(program_id, {startDate, endDate} = {}, filter = [], org_id_array = []){

    const { isConnected, isDisconnected, lastConnected } =
    useDhis2ConnectionStatus()

    //  json response format {loading, error, data}

    const online = useFetchAnalytics(program_id, {startDate, endDate} = {}, filter = [], org_id_array = [])
    const offline = useOfflineFetchAnalytics(program_id, {startDate, endDate} = {}, filter = [], org_id_array = [])
    if (isDisconnected){

        return offline
    }else{
        
        // Caching policy here 
        return online
    }

}



export default useAnalytics