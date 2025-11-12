import { useDataQuery } from '@dhis2/app-runtime'

const schoolAnalyticsQuery = {
    analytics: {
        resource: 'analytics/events/query',
        id: ({ programId }) => programId,
        params: ({ programId, stageId, schoolId, startDate, endDate, dataElements = [] }) => {
            const baseDimensions = [
                `ou:${schoolId}`,
                ...dataElements.filter(Boolean)
            ]

            return {
                program: programId,
                stage: stageId,
                dimension: baseDimensions,
                outputType: 'EVENT',               
                startDate: startDate ?? '2024-01-01',
                endDate: endDate ?? new Date().toISOString().split('T')[0],
                displayProperty: 'NAME',
                skipMeta: false,
                includeMetadataDetails: true,
                paging: false,
            }
        },
    },
}


export function useSchoolAnalytics({ programId, stageId, schoolId, startDate, endDate, dataElements }) {
    const ready = Boolean(programId && schoolId)
    const { loading, error, data } = useDataQuery(schoolAnalyticsQuery, {
        variables: { programId, stageId, schoolId, startDate, endDate, dataElements },
        lazy: !ready,
    })
    return { loading, error, data: data?.analytics }
}
