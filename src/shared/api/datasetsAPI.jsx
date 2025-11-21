import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

const DATASETS_QUERY = {
    dataSets: {
        resource: "dataSets",
        params: () => ({
            fields: ["*"],
            paging: false,
        }),
    },
}

export default function useFetchDatasets() {

    const dataKey = "dataSets-all-v1"       // stable, versionable
    const variables = {}                    // no variables needed

    const { data, loading, error } = useCacheableQuery(
        "data",
        dataKey,
        DATASETS_QUERY,
        variables
    )

    return {
        data: data?.dataSets,
        loading,
        error,
    }
}