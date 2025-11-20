import useFetchAnalytics from '../api/analyticsAPI'

function useAnalytics(program_id, {startDate, endDate} = {}, filter = [], org_id_array = []){

    //  json response format {loading, error, data}
    const online = useFetchAnalytics(program_id, {startDate, endDate}, filter, org_id_array)
        
    // Caching policy here
    return online
}



export default useAnalytics