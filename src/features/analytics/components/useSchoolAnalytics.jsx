import {useCacheableQuery} from "../../../shared/cache/cacheableQuery";
import {useMemo} from "react";
import {useDataQuery} from "@dhis2/app-runtime";

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

    const variables = useMemo(() => ({
        programId,
        stageId,
        schoolId,
        startDate,
        endDate,
        dataElements,
    }), [programId, stageId, schoolId, startDate, endDate, dataElements])

    const dataKey =
        `${schoolId}-${programId}-${stageId}-${startDate}-${endDate}-${(dataElements || []).join('_')}`

    /*
    return useCacheableQuery(
        'events',
        dataKey,
        schoolAnalyticsQuery,   // already stable
        variables
    )

    */


    const {loading, error, data} = useDataQuery(schoolAnalyticsQuery, {
        variables: variables,
    })
    return {loading, error, data: data?.analytics}

}

