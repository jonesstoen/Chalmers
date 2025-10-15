import { useDataMutation } from '@dhis2/app-runtime'


// Usage const [mutate, { loading, error }] = postEvent()
// Not tested and WiP
function usePostEvent(){

    // Takes the datatime from today TODO
    const today = new Date().toISOString().split('T')[0];  // e.g., '2025-10-15'

    const dataMutationQuery = {
        resource: 'tracker/events',
        type: 'create',
        data: ({program_id, programStage, period = today, orgUnit_id, status = 'COMPLETED', dataValueObjectArray}) => ({
            events: [
            {
                program: program_id,
                eventDate: period,
                orgUnit: orgUnit_id,
                programStage: programStage,
                status: status,
                dataValues: dataValueObjectArray
            }
            ]
        })
    }


    return useDataMutation(dataMutationQuery) 

}



export default usePostEvent