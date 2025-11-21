import {useMemo} from "react"
import {useCacheableQuery} from "../../../shared/cache/cacheableQuery"

// ---- STATIC QUERY (DHIS2-safe) ----
const ORG_UNIT_QUERY = {
    ou: {
        resource: "organisationUnits",
        id: ({ id }) => id,   // resolved per OU ID
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
        }),
    },
}

export default function useFetchOrgUnits(orgIds = []) {

    // ---- Stable variables ----
    const variables = useMemo(() => {
        const v = {}
        for (const id of orgIds) {
            v[id] = { id }
        }
        return v
    }, [orgIds])

    // ---- Stable dataKey ----
    const dataKey = useMemo(() =>
            JSON.stringify({
                type: "orgUnits",
                ids: [...orgIds].sort(),
            }),
        [orgIds]
    )

    // ---- Use same query object for all requests ----
    return useCacheableQuery("data", dataKey, ORG_UNIT_QUERY, variables)
}