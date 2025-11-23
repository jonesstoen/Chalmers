// src/D2App/features/inspections/hooks/useUpdateSchoolInspectionEvent.jsx
import usePostEvent from '../../../../shared/api/useTrackerEventMutation'

/**
 * Oppdaterer et eksisterende School Inspection-event via Tracker Importer
 * -> POST /api/42/tracker?importStrategy=UPDATE
 */
export function useUpdateSchoolInspectionEvent() {
    const [mutate, status] = usePostEvent('PUT')
    const update = ({
                        eventId,
                        orgUnit,
                        occurredAt,
                        status: eventStatus = 'COMPLETED',
                        programId = 'UxK2o06ScIe',
                        programStageId = 'eJiBjm9Rl7E',
                        dataValues,
                    }) => mutate({
        eventId,                    // for logging
        orgUnit_id: orgUnit,
        occurredAt,
        status: eventStatus,
        program_id: programId,
        programStage: programStageId,
        dataValueObjectArray: dataValues,
    })
    return [update, status]
}