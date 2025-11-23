// pages/SchoolInspectionPage/editInspection/hooks/useDeleteSchoolInspection.jsx
import usePostEvent from '../../../../shared/api/useTrackerEventMutation'

export function useDeleteSchoolInspectionEvent() {
    const [mutate, status] = usePostEvent('DELETE')
    const remove = ({ eventId }) => mutate({ eventId })
    return [remove, status]
}