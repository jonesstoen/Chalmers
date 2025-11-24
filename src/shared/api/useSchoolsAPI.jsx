import { useMemo } from "react"
import { useCacheableQuery } from "../cache/cacheableQuery"

const ORG_UNIT_FIELDS = [
    "id",
    "displayName",
    "level",
    "children[id]",
    "path",
].join(",")

const EMPTY_QUERY = {
    noop: {
        resource: "organisationUnits",
        params: () => ({
            fields: "id",
            pageSize: 1,
        }),
    },
}

const EMPTY_VARS = {}

const createRootEntry = index => ({
    resource: "organisationUnits",
    id: ({ regionIds }) => regionIds[index],
    params: {
        fields: ORG_UNIT_FIELDS,
    },
})

const createDescEntry = index => ({
    resource: "organisationUnits",
    params: ({ regionIds }) => ({
        filter: [`path:like:${regionIds[index]}`],
        fields: ORG_UNIT_FIELDS,
        paging: false,
    }),
})

const buildStableQuery = (count) => {
    if (count === 0) {
        return EMPTY_QUERY
    }

    const query = {}

    for (let index = 0; index < count; index += 1) {
        query[`root_${index}`] = createRootEntry(index)
        query[`desc_${index}`] = createDescEntry(index)
    }

    return query
}

const sanitizeRegionIds = (regionIds) => {
    if (!Array.isArray(regionIds)) {
        return []
    }

    return regionIds
        .map(id => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean)
}

export function useSchoolsByRegions(regionIds = []) {
    const validIds = useMemo(() => sanitizeRegionIds(regionIds), [regionIds])
    const idSignature = useMemo(() => validIds.join("|"), [validIds])
    const regionCount = validIds.length
    const hasRegions = regionCount > 0

    const variables = useMemo(() => {
        return hasRegions ? { regionIds: validIds } : EMPTY_VARS
    }, [idSignature, hasRegions, validIds])

    const query = useMemo(() => {
        return buildStableQuery(hasRegions ? regionCount : 0)
    }, [hasRegions, regionCount])

    const dataKey = useMemo(() => {
        return hasRegions
            ? `query:schoolsByRegions:${idSignature}`
            : "query:schoolsByRegions:empty"
    }, [hasRegions, idSignature])

    const { loading, error, data } = useCacheableQuery(
        "data",
        dataKey,
        query,
        variables,
        !hasRegions
    )

    if (loading || error || !data) {
        return { schools: [], loading, error }
    }

    // ---- Extract roots (regions) ----
    const roots = Object.keys(data)
        .filter(k => k.startsWith('root_'))
        .map(k => ({
            ...data[k],
            type: 'region'
        }))

    // ---- Extract descendants ----
    // Remove descendants that are already roots
    const descendants = Object.keys(data)
        .filter(k => k.startsWith('desc_'))
        .flatMap(k => data[k].organisationUnits || [])
        .filter(u => !regionIds.includes(u.id))

    // ---- Tag clusters & schools ----
    const taggedDescendants = descendants.map(u => ({
        ...u,
        type: u.children && u.children.length > 0 ? 'cluster' : 'school'
    }))

    // ---- Merge everything ----
    const merged = [...roots, ...taggedDescendants]

    return {
        schools: merged,   // Your search bar expects "schools"
        loading,
        error,
    }
}
