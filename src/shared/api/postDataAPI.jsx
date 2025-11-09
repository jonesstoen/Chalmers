// src/D2App/services/api/postDataAPI.jsx
import { useDataMutation } from '@dhis2/app-runtime'
import { useMemo } from 'react'

export default function usePostEvent(type = 'POST') {
    const today = new Date().toISOString().split('T')[0]

    const formatDataValues = (dataValueObjectArray) =>
    dataValueObjectArray
        .filter(({ dataElement, value }) => dataElement && value !== '' && value !== null && value !== 0 && value !== false)
        .map(({ dataElement, value }) => ({
            dataElement,
            value: String(value),
        }))


    const createQuery = {
        
        resource: 'tracker',
        
        type: 'create',
        params: {
            async: false,
        },
        data: ({
            program_id,
            programStage,
            orgUnit_id,
            dataValueObjectArray,
            period = today,
            status = 'COMPLETED',
        }) => ({
            events: [
                {
                    program: program_id,
                    programStage,
                    orgUnit: orgUnit_id,
                    occurredAt: `${period}T00:00:00.000`,
                    status,
                    dataValues: formatDataValues(dataValueObjectArray),
                },
            ],
        }),
        
    }

    const updateQuery = {
        resource: 'events',
        type: 'update',
        partial: true,
        data: ({ eventId, dataValueObjectArray }) => ({
            events: [
                {
                    event: eventId,
                    dataValues: formatDataValues(dataValueObjectArray),
                },
            ],
        }),
    }

    const deleteQuery = {
        resource: 'events',
        type: 'delete',
        data: ({ eventId }) => ({ events: [{ event: eventId }] }),
    }

    const selectedQuery = useMemo(() => {
        switch (type) {
            case 'POST':
                return createQuery
            case 'PUT':
                return updateQuery
            case 'DELETE':
                return deleteQuery
            default:
                throw new Error(`Invalid mutation type '${type}'`)
        }
    }, [type])
    console.log("Using tracker mutation ✅")

    return useDataMutation(selectedQuery)
}
// 