import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import usePostEvent from '../api/postDataAPI'



// type = POST,PUT or DELETE
function useEvent(type){
    const { isConnected, isDisconnected, lastConnected } =
        useDhis2ConnectionStatus()
    const online = usePostEvent(type)
    const offline = useOfflinePostEvent(type)



    if(isDisconnected){
        // POST to the cache -> need to figure out how it can auto post to the endpoint when connection is up again TODO
        return offline
    }else{
        // No need to cache POST
        return online
    }

}

export default useEvent