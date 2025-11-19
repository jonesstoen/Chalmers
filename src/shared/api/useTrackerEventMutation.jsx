// shared/api/useTrackerEventMutation.jsx
import { useDataMutation } from '@dhis2/app-runtime'
import { useMemo } from 'react'

export default function usePostEvent(type = 'POST') {
    const today = new Date().toISOString().split('T')[0]

    const formatDataValues = (arr) =>
        (arr || [])
            .filter(({ dataElement, value }) => dataElement && value !== '' && value !== undefined && value !== null)
            .map(({ dataElement, value }) => ({ dataElement, value: String(value) }))

    const createQuery = {
        resource: 'tracker',
        type: 'create',
        params: { async: false, importStrategy: 'CREATE' },
        data: ({ program_id, programStage, orgUnit_id, dataValueObjectArray, period = today, status = 'COMPLETED' }) => ({
            events: [{
                program: program_id,
                programStage,
                orgUnit: orgUnit_id,
                occurredAt: `${period}T00:00:00.000`,
                status,
                dataValues: formatDataValues(dataValueObjectArray),
            }],
        }),
    }


    const updateQuery = {
        resource: 'tracker',
        type: 'create', // POST mot tracker-endpoint
        params: {
            importStrategy: 'UPDATE',
            async: false,
        },
        data: ({
                   eventId,
                   program_id,
                   programStage,
                   orgUnit_id,
                   occurredAt,
                   status = 'COMPLETED',
                   dataValueObjectArray,
               }) => ({
            events: [{
                event: eventId,
                program: program_id,
                programStage,
                orgUnit: orgUnit_id,
                occurredAt,
                status,
                dataValues: formatDataValues(dataValueObjectArray),
            }],
        }),
    }

    const deleteQuery = {
        resource: 'tracker',
        type: 'create',
        params: { async: false, importStrategy: 'DELETE' },
        data: ({ eventId }) => ({ events: [{ event: eventId }] }),
    }

    const selectedQuery = useMemo(() => {
        switch (type) {
            case 'POST': return createQuery
            case 'PUT':  return updateQuery
            case 'DELETE': return deleteQuery
            default: throw new Error(`Invalid mutation type '${type}'`)
        }
    }, [type])

    return useDataMutation(selectedQuery)
}