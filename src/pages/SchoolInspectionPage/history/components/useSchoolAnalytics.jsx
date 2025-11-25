import { useMemo } from "react"
import { useCacheableQuery } from "../../../../shared/cache/cacheableQuery"

function buildAnalyticsParams({
        programId,
        stageId,
        schoolId,
        startDate,
        endDate,
        dataElements = [],
    }) {
    const baseDimensions = [
        `ou:${schoolId}`,
        ...dataElements.filter(Boolean)
    ]

    return {
        program: programId,
        stage: stageId,
        dimension: baseDimensions,
        outputType: "EVENT",
        startDate: startDate ?? "2024-01-01",
        endDate: endDate ?? new Date().toISOString().slice(0, 10),
        displayProperty: "NAME",
        skipMeta: false,
        includeMetadataDetails: true,
        paging: false,
    }
}

const SCHOOL_ANALYTICS_QUERY = {
    analytics: {
        resource: "analytics/events/query",
        id: ({ programId }) => programId,
        params: buildAnalyticsParams,  // stable function reference
    },
}

export function useSchoolAnalytics({
        programId,
        stageId,
        schoolId,
        startDate,
        endDate,
        dataElements = [],
    }) {

    const variables = useMemo(() => ({
        programId,
        stageId,
        schoolId,
        startDate,
        endDate,
        dataElements,
    }), [
        programId,
        stageId,
        schoolId,
        startDate,
        endDate,
        dataElements,
    ])

    const dataKey = useMemo(() => {
        return JSON.stringify({
            type: "schoolAnalytics",
            programId,
            stageId,
            schoolId,
            startDate,
            dataElements,
        })
    }, [
        programId,
        stageId,
        schoolId,
        startDate,
        dataElements,   // endDate intentionally excluded
    ])

    const { data, loading, error } = useCacheableQuery(
        "data",
        dataKey,
        SCHOOL_ANALYTICS_QUERY,
        variables
    )

    return {
        loading,
        error,
        data: data?.analytics,
    }
}
