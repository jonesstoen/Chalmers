import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import useFetchAnalytics from '../api/analyticsAPI'

function useAnalytics(/*PARAMS TODO*/){

    const { isConnected, isDisconnected, lastConnected } =
    useDhis2ConnectionStatus()

    //  json response format {loading, error, data}

    const online = useFetchAnalytics(/*Fill in the PARAMS todo*/)
    const offline = useOfflineFetchAnalytics(/*PARAMS in the same format*/)
    if (isDisconnected){

        return offline
    }else{
        
        // Caching policy here 
        return online
    }

}



export default useAnalytics