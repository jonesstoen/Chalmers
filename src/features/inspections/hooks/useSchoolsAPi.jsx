import { useDataQuery } from '@dhis2/app-runtime'

// Build dynamic query
const buildQuery = (regionIds) => {
    const q = {}

    regionIds.forEach((id, index) => {
        // Fetch the region node itself
        q[`root_${index}`] = {
            resource: 'organisationUnits',
            id,
            params: {
fields: 'id,displayName,level,children[id],path',
            },
        }

        // Fetch ALL descendants
        q[`desc_${index}`] = {
            resource: 'organisationUnits',
            params: {
                filter: [`path:like:${id}`],
fields: 'id,displayName,level,children[id],path',
                paging: false,
            },
        }
    })

    return q
}

export function useSchoolsByRegions(regionIds = []) {
    const query = buildQuery(regionIds)

    const { loading, error, data } = useDataQuery(query, {
        variables: {},
        skip: regionIds.length === 0,
    })

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
  // Remove descendants that ARE already roots
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
