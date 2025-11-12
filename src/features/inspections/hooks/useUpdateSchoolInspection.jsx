// features/inspections/hooks/useUpdateSchoolInspectionEvent.jsx
import usePostEvent from '../../../shared/api/postDataAPI'

export function useUpdateSchoolInspectionEvent() {
    const [mutate, status] = usePostEvent('PUT')
    const update = ({ eventId, dataValues }) =>
        mutate({ eventId, dataValueObjectArray: dataValues })
    return [update, status]
}