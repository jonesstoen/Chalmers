// features/org-units/api/useFetchOrgUnits.jsx
import { useMemo } from "react"
import { useDataQuery } from "@dhis2/app-runtime"
// import { useCacheableQuery } from "../../../shared/cache/cacheableQuery" // Temporarily disabled to test

// ---------------------------------------------------------------------------
// STATIC QUERY – must be static for DHIS2 useDataQuery
// ---------------------------------------------------------------------------
const ORG_UNIT_QUERY = {
    ou: {
        resource: "organisationUnits",
        id: ({ id }) => id, // Function that returns the id from variables
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
                // Return empty object - lazy will prevent execution
                return {}
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

    // Debug logging (remove after fixing)
    if (selectedId) {
        console.log('[useFetchOrgUnits] Fetching org unit:', {
            selectedId,
            variables,
            lazy,
            dataKey
        })
    }

    // -----------------------------------------------------------------------
    // Make the query — use static query with variables
    // -----------------------------------------------------------------------
    console.log('🔍 [useFetchOrgUnits] About to call useDataQuery:', {
        selectedId,
        variables,
        lazy,
        queryId: variables.id
    })
    
    const {
        data: networkData,
        loading,
        error,
        refetch,
    } = useDataQuery(ORG_UNIT_QUERY, {
        variables,
        lazy,
    })
    
    console.log('📊 [useFetchOrgUnits] useDataQuery result:', {
        hasNetworkData: !!networkData,
        networkDataKeys: networkData ? Object.keys(networkData) : [],
        networkDataOu: networkData?.ou,
        loading,
        error: error?.message || error,
        errorFull: error
    })
    
    // For now, just use network data directly (bypass cache)
    const data = networkData
    const source = "network"

    // Debug logging (remove after fixing)
    if (selectedId) {
        console.log('[useFetchOrgUnits] Query result:', {
            selectedId,
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            dataOu: data?.ou,
            dataFull: data, // Log full data structure
            loading,
            error: error?.message,
            source,
            variables
        })
    }

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
