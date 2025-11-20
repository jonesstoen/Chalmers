import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

export default function useFetchDatasets() {

    // ---- 1. Stable query object ----
    const query = useMemo(() => ({
        dataSets: {
            resource: "dataSets",
            params: {
                fields: ["*"],
                paging: false,
            },
        },
    }), [])

    // ---- 2. Stable dataKey (unique & unchanging) ----
    const dataKey = "dataSets-all-v1"
    // You can later version-bump ("dataSets-all-v2") if you change fields.

    // ---- 3. Variables (none needed but structure required) ----
    const variables = {}

    // ---- 4. Use cacheableQuery ----
    const { data, loading, error } = useCacheableQuery(
        "data",     // <-- unified cache namespace
        dataKey,
        query,
        variables
    )

    return {
        loading,
        error,
        data: data?.dataSets,
    }
}
