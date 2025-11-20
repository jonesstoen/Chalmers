import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

export default function useFetchOrgUnits(orgIds = []) {

    // ---- 1. Stable dataKey (OU list only, sorted for stability) ----
    const dataKey = useMemo(() => {
        const sorted = [...orgIds].sort()
        return JSON.stringify({
            type: "orgUnits",
            orgIds: sorted,
        })
    }, [orgIds])

    // ---- 2. Stable variables for the query ----
    // Each key becomes a sub-query in useDataQuery
    const variables = useMemo(() => {
        const vars = {}
        for (const id of orgIds) {
            vars[id] = { id }
        }
        return vars
    }, [orgIds])

    // ---- 3. Stable query object (memoized once) ----
    // DHIS2 `useDataQuery` supports MULTI-QUERY style:
    // query = { ou1: { resource, id, params }, ou2: { ... } }
    const query = useMemo(() => ({
        // We dynamically build subqueries based on variables
        ...Object.fromEntries(
            Object.keys(variables).map(id => [
                id,
                {
                    resource: "organisationUnits",
                    id: ({ id }) => id,           // → /organisationUnits/{id}
                    params: () => ({
                        fields: [
                            "children[name,id]",
                            "parents[name,id]",
                            "name",
                            "id",
                            "programs[name,id]",
                            "dataSets[name,id]"
                        ],
                        paging: false,
                    })
                }
            ])
        )
        // IMPORTANT: query must NOT depend on variables (shape only)
    }), [])

    // ---- 4. Run cacheable query ----
    return useCacheableQuery(
        "data",     // <-- ALWAYS "data"
        dataKey,
        query,
        variables
    )
}