import { useDataMutation } from '@dhis2/app-runtime'


// Usage const [mutate, { data, loading, error }] = postEvent()
// Not tested and WiP
function usePostEvent(type /*type = POST, PUT, DELETE*/){

    // Takes the datatime from today TODO
    const today = new Date().toISOString().split('T')[0];  // e.g., '2025-10-15'

    const dataCreateQuery = {
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
                dataValues: dataValueObjectArray // array with id and value objects [{UID:"", value:xyz},...]
            }
            ]
        })
    }

    const dataUpdateQuery = {
        resource: 'tracker/events',
        type: 'update',
        partial: true, // Only replacing provided fields
        data: ({eventId,program_id, programStage, period = today, orgUnit_id, status = 'COMPLETED', dataValueObjectArray}) => ({
            events: [
               {
                event: eventId,
                program: program_id, // School inspector program ID is: UxK2o06ScIe
                eventDate: period, // When its recorded
                orgUnit: orgUnit_id, // Where the data is connected to Gambia / region / school etc
                programStage: programStage, // Stage of the given program the data is related to 
                status: status,
                dataValues: dataValueObjectArray // array with id and value objects [{UID:"", value:xyz},...]
                } 
            ]
        })

    }

    const dataDeleteQuery = {
        resource: 'tracker/events',
        type: 'delete',
        data: ({eventId}) =>({events:[{
            event: eventId
        }]})
    }

    // Choose correct query depending on type
    const query = useMemo(() => {
        switch (type) {
            case 'POST':
                return dataCreateQuery
            case 'PUT':
                return dataUpdateQuery
            case 'DELETE':
                return dataDeleteQuery
            default:
                return null
        }
    }, [type])

    // If invalid type, returns a mock response with error shape
    if (!query) {
        const fakeMutate = async () => {
            throw new Error(`Invalid mutation type: ${type}. Expected 'POST', 'PUT', or 'DELETE'.`)
        }

        return [
            fakeMutate,
            { data: undefined, loading: false, error: new Error(`Invalid type: ${type}`) },
        ]
    }

    return useDataMutation(query)
}



export default usePostEvent