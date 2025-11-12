import { useDataQuery } from '@dhis2/app-runtime'

const schoolAnalyticsQuery = {
    analytics: {
        // keep resource static
        resource: 'analytics/events/query',
        // dynamically append program ID through `id`
        id: ({ program }) => program,
        params: ({ program, stage, schoolId, startDate, endDate, dataElements }) => {
            const dimensions = [`ou:${schoolId}`, ...(dataElements || [])]

            return {
                stage,
                outputType: 'EVENT',
                skipMeta: false,
                displayProperty: 'NAME',
                includeMetadataDetails: true,
                paging: false,
                startDate: startDate ?? '2024-01-01',
                endDate: endDate ?? new Date().toISOString().split('T')[0],
                dimension: dimensions, // @dhis2/runtime repeats these automatically
            }
        },
    },
}

export function useSchoolAnalytics({ programId, stageId, schoolId, startDate, endDate, dataElements }) {
    const ready = Boolean(programId && schoolId)
    const variables = {
        program: programId,
        stage: stageId,
        schoolId,
        startDate,
        endDate,
        dataElements,
    }

    const { loading, error, data } = useDataQuery(schoolAnalyticsQuery, {
        variables,
        lazy: !ready,
    })

    return { loading, error, data: data?.analytics }
}
