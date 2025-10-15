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
                program: program_id, // School inspector program ID is: UxK2o06ScIe
                eventDate: period, // When its recorded
                orgUnit: orgUnit_id, // Where the data is connected to Gambia / region / school etc
                programStage: programStage, // Stage of the given program the data is related to 
                status: status,
                dataValues: dataValueObjectArray // array with id and value objects {UID:"", value:xyz}
            }
            ]
        })
    }


    return useDataMutation(dataMutationQuery) 

}



export default usePostEvent