// src/D2App/services/api/usePostSchoolInspectionEvent.jsx
import usePostEvent from '../../../shared/api/postDataAPI'

export function usePostSchoolInspectionEvent() {
    const [postEvent, status] = usePostEvent('POST')

    const submit = ({ orgUnit_id, dataValues, date }) =>
        postEvent({
            program_id: 'UxK2o06ScIe',
            programStage: 'eJiBjm9Rl7E', 
            orgUnit_id,
            period: date ?? new Date().toISOString().split('T')[0],
            status: 'COMPLETED',
            dataValueObjectArray: dataValues,
        })
    
    return [submit, status]
}
