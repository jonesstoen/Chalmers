import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

// ---- FIX: Make it a function that returns the query object ----
const makeSchoolAnalyticsQuery = () => ({
    analytics: {
        resource: "analytics/events/query",
        id: ({ programId }) => programId,
        params: ({
                     programId,
                     stageId,
                     schoolId,
                     startDate,
                     endDate,
                     dataElements = [],
                 }) => {
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
        },
    },
})


export function useSchoolAnalytics({
                                       programId,
                                       stageId,
                                       schoolId,
                                       startDate,
                                       endDate,
                                       dataElements = [],
                                   }) {

    // ---- 1. Stable variables ----
    const variables = useMemo(() => ({
        programId,
        stageId,
        schoolId,
        startDate,
        endDate,
        dataElements,
    }), [programId, stageId, schoolId, startDate, endDate, dataElements])


    // ---- 2. Stable dataKey (NO endDate by your rule) ----
    const dataKey = useMemo(() =>
            JSON.stringify({
                type: "schoolAnalytics",
                programId,
                stageId,
                schoolId,
                startDate,
                dataElements,
            }),
        [programId, stageId, schoolId, startDate, dataElements]
    )


    // ---- 3. Stable query: useMemo INSIDE hook (legal!) ----
    const query = useMemo(() => makeSchoolAnalyticsQuery(), [])


    // ---- 4. Fetch through cache layer ----
    const { data, loading, error } = useCacheableQuery(
        "data",        // <--- use "data" always
        dataKey,
        query,
        variables
    )


    // ---- 5. Preserve old return shape ----
    return {
        loading,
        error,
        data: data?.analytics,
    }
}
