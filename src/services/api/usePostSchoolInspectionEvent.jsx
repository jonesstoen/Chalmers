import usePostEvent from './postDataAPI'
export function usePostSchoolInspectionEvent() {
  const [postEvent, status] = usePostEvent()

  return [
    ({ orgUnit_id, dataValues, date, status = 'COMPLETED' }) =>
      postEvent({
        program_id: 'UxK2o06ScIe',
        programStage: 'eJiBjm9Rl7E',
        orgUnit_id,
        period: date ?? new Date().toISOString().split('T')[0],
        status,
        dataValueObjectArray: dataValues,
      }),
    status,
  ]
}
