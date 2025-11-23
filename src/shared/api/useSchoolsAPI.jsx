import { useMemo } from "react"
import { useCacheableQuery } from "../cache/cacheableQuery"

// -----------------------------------------------------------
// STATIC QUERY STRUCTURE (required for DHIS2)
// The only dynamic part must be variables, not the shape.
// -----------------------------------------------------------
const STATIC_QUERY = {
    roots: {
        resource: "organisationUnits",
        id: ({ ids }) => ids[0], // replaced dynamically
        params: ({ }) => ({
            fields: "id,displayName,level,children[id],path",
        }),
    },
    descendants: {
        resource: "organisationUnits",
        params: ({ ids }) => ({
            filter: `path:like:${ids[0]}`,
            fields: "id,displayName,level,children[id],path",
            paging: false,
        }),
    },
}

/**
 * Cached region/school loader
 */
export function useSchoolsByRegions(regionIds = []) {
    const safeIds = Array.isArray(regionIds) ? regionIds : []
    const validIds = safeIds.filter(id => id && typeof id === "string")

    // Nothing to load
    if (validIds.length === 0) {
        return { schools: [], loading: false, error: null }
    }

    // -----------------------------------------------------------
    // Create a stable dataKey for caching
    // -----------------------------------------------------------
    const dataKey = useMemo(
        () =>
            JSON.stringify({
                type: "regionTree",
                ids: [...validIds].sort(), // deterministic key
            }),
        [validIds]
    )

    // -----------------------------------------------------------
    // Build variables — the ONLY dynamic part
    // -----------------------------------------------------------
    const variables = useMemo(
        () => ({
            ids: validIds,
        }),
        [validIds]
    )

    // -----------------------------------------------------------
    // RUN USECACHEABLEQUERY
    // -----------------------------------------------------------
    const { data, loading, error, source } = useCacheableQuery(
        "data",
        dataKey,
        STATIC_QUERY,
        variables,
        false // not lazy
    )

    //------------------------------------------------------------
    // No data yet
    //------------------------------------------------------------
    if (loading || error || !data) {
        return { schools: [], loading, error }
    }

    //------------------------------------------------------------
    // Normalize structure (matches your original logic)
    //------------------------------------------------------------

    const root = data.roots // a single org unit (not array)
    const descendants =
        data.descendants?.organisationUnits || []

    // Filter out the region itself so it isn’t included twice
    const filteredDesc = descendants.filter(
        u => !validIds.includes(u.id)
    )

    const taggedDescendants = filteredDesc.map(u => ({
        ...u,
        type: u.children && u.children.length > 0 ? "cluster" : "school",
    }))

    const finalList = [
        {
            ...root,
            type: "region",
        },
        ...taggedDescendants,
    ]

    return {
        schools: finalList,
        loading,
        error,
        source, // cache | stale-cache | network
    }
}