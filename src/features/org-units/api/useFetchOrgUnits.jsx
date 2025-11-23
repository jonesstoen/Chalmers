// features/org-units/api/useFetchOrgUnits.jsx
import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

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
    // Make the query — use cacheableQuery (checks cache first, then fetches if needed)
    // -----------------------------------------------------------------------
    const {
        data: rawData,
        loading,
        error,
        refetch,
        source,
    } = useCacheableQuery(
        "data", // cacheKey
        dataKey,
        ORG_UNIT_QUERY,
        variables,
        !selectedId // forceLazy: true when no selectedId (skip query)
    )
    
    // Extract the org unit from the response
    // When querying by ID, DHIS2 returns { ou: { organisationUnits: [orgUnit] } } 
    // We need to extract the org unit from the array that matches our selectedId
    let data = rawData
    if (rawData?.ou) {
        // Check if ou has organisationUnits array (list response)
        if (rawData.ou.organisationUnits && Array.isArray(rawData.ou.organisationUnits)) {
            if (rawData.ou.organisationUnits.length > 0) {
                // Find the org unit that matches our selectedId (in case array has multiple)
                const matchingOu = rawData.ou.organisationUnits.find(ou => ou.id === selectedId) 
                    || rawData.ou.organisationUnits[0] // Fallback to first if no match
                
                data = {
                    ou: matchingOu
                }
            } else {
                // Empty array - no data
                data = { ou: null }
            }
        } else if (rawData.ou.id) {
            // ou is already the org unit object (single item response)
            // Use it as is
            data = rawData
        } else {
            // Unexpected structure
            console.warn('⚠️ [useFetchOrgUnits] Unexpected data structure:', rawData.ou)
            data = { ou: null }
        }
    }
    
    // Single consolidated log for debugging
    if (selectedId) {
        console.log('[useFetchOrgUnits]', {
            selectedId,
            hasData: !!data?.ou,
            orgUnitId: data?.ou?.id,
            orgUnitName: data?.ou?.name || data?.ou?.displayName,
            isCluster: !!(data?.ou?.children?.length > 0),
            loading,
            error: error?.message,
            source // Shows if data came from cache or network
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
