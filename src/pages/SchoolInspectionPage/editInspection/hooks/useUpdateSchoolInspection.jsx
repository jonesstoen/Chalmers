import usePostEvent from '../../../../shared/api/useTrackerEventMutation'

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
        dataValues: dataValues,
    })
    return [update, status]
}