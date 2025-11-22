// features/org-units/api/useFetchOrgUnits.jsx
import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

// ---------------------------------------------------------------------------
// STATIC QUERY – same pattern as EVENTS_ANALYTICS_QUERY
// ---------------------------------------------------------------------------
const ORG_UNIT_QUERY = {
    ou: {
        resource: "organisationUnits",
        id: ({ id }) => {
            // Only return id if it's a valid string, otherwise return undefined to prevent query execution
            return id && typeof id === 'string' && id.trim() !== '' ? id : undefined
        },
        params: () => ({
            fields: [
                "id",
                "name",
                "displayName",
                "level",
                "parent[id,name]",
                "children[id,name]",
                "programs[id,name,programStages[id,name,displayName]]",
                "dataSets[id,name]",
            ].join(","),
            paging: false,
        }),
    },
}

// ---------------------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------------------
export default function useFetchOrgUnits(orgIds = []) {
    // Always sanitize the input
    const safeOrgIds = Array.isArray(orgIds) ? orgIds : []

    // Select *one* org unit (same behaviour as your original hook)
    // Filter out empty strings and null values
    const validIds = safeOrgIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
    const selectedId = validIds.length > 0 ? validIds[0] : null

    // -----------------------------------------------------------------------
    // VARIABLES — only create when we have a valid selectedId
    // -----------------------------------------------------------------------
    const variables = useMemo(
        () => {
            if (!selectedId) {
                // Return a dummy object to satisfy useDataQuery, but lazy will prevent execution
                return { id: null }
            }
            return {
                id: selectedId,
            }
        },
        [selectedId]
    )

    // -----------------------------------------------------------------------
    // DATAKEY — exact same pattern as analytics hook
    // -----------------------------------------------------------------------
    const dataKey = useMemo(
        () =>
            JSON.stringify({
                type: "orgUnit",
                id: selectedId ?? "__none__",
            }),
        [selectedId]
    )

    // -----------------------------------------------------------------------
    // LAZY MODE — block fetch when no OU is selected
    // -----------------------------------------------------------------------
    const lazy = !selectedId

    // -----------------------------------------------------------------------
    // Make the query — same signature as analytics hook
    // -----------------------------------------------------------------------
    const {
        data,
        loading,
        error,
        refetch,
        source,
    } = useCacheableQuery(
        "data",            // cache bucket
        dataKey,           // stable key
        ORG_UNIT_QUERY,    // static query definition
        variables,         // stable variables
        lazy               // 5th parameter (your updated hook supports this)
    )

    // -----------------------------------------------------------------------
    // Output — when no selectedId, behave like "no data"
    // -----------------------------------------------------------------------
    return {
        data: selectedId ? data : null,
        loading: selectedId ? loading : false,
        error: selectedId ? error : null,
        selectedId,
        refetch,
        source,
    }
}
