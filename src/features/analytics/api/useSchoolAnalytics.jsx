import { useDataQuery } from '@dhis2/app-runtime'

const schoolAnalyticsQuery = {
    analytics: {
        resource: 'analytics/events/query',
        id: ({ programId }) => `${programId}.json`,
        params: ({ programId, stageId, schoolId, startDate, endDate, dataElements = [] }) => {
            const baseDimensions = [`ou:${schoolId}`, ...dataElements.map(id => id)]
            // Build repeated dimension parameters properly
            const dimension = baseDimensions

            return {
                program: programId,
                stage: stageId,
                dimension, // repeated automatically by @dhis2/app-runtime
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
