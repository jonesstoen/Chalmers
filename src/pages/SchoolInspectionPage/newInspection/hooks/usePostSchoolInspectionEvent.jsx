// src/D2App/services/api/usePostSchoolInspectionEvent.jsx
import usePostEvent from '../../../../shared/api/useTrackerEventMutation'

function usePostSchoolInspectionEvent() {
    const [postEvent, status] = usePostEvent('POST')

    const submit = ({ orgUnit_id, dataValues, date }) =>
        postEvent({
            program_id: 'UxK2o06ScIe', // School inspection program
            programStage: 'eJiBjm9Rl7E', // CHK programstage
            orgUnit_id,
            dataValues,  // ✅ FIXED: correct property name
            period: date ?? new Date().toISOString().split('T')[0],
            status: 'COMPLETED',
        })

    return [submit, status]
}

export default usePostSchoolInspectionEvent
