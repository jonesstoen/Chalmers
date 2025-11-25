import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

const getId = ({ id }) => id

// fully stable query object
const STABLE_ORG_UNIT_QUERY = {
    ou: {
        resource: "organisationUnits",
        id: getId,
        params: {
            fields: [
                "id",
                "name",
                "displayName",
                "level",
                "parent[id,name]",
                "children[id,name]",
                "programs[id,name,programStages[id,name,displayName]]",
                "dataSets[id,name]"
            ].join(","),
            paging: false,
        },
    },
}

const EMPTY_VARS = {}

export default function useFetchOrgUnits(orgIds = []) {
    const safeOrgIds = Array.isArray(orgIds) ? orgIds : []
    const validIds = safeOrgIds.filter(id => typeof id === "string" && id.trim() !== "")
    const selectedId = validIds.length > 0 ? validIds[0] : null

    const variables = useMemo(() => {
        return selectedId ? { id: selectedId } : EMPTY_VARS
    }, [selectedId])

    const dataKey = useMemo(() => {
        return selectedId
            ? `query:orgUnit:byId:${selectedId}`
            : "query:orgUnit:empty"
    }, [selectedId])

    const { data: rawData, loading, error, refetch, source } =
        useCacheableQuery(
            "data",
            dataKey,
            STABLE_ORG_UNIT_QUERY,
            variables,
            !selectedId
        )

    // normalize DHIS2 quirks :)
    let data = rawData

    if (rawData?.ou) {
        if (Array.isArray(rawData.ou.organisationUnits)) {
            const found =
                rawData.ou.organisationUnits.find(ou => ou.id === selectedId) ??
                rawData.ou.organisationUnits[0]

            data = { ou: found }
        }
    }

    return {
        data: selectedId ? data : null,
        loading: selectedId ? loading : false,
        error: selectedId ? error : null,
        selectedId,
        refetch,
        source,
    }
}
