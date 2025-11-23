import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

// STATIC query — no functions anywhere
const ORG_UNIT_QUERY = {
    ou: {
        resource: "organisationUnits",
        id: ({ id }) => id,
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
};

export default function useFetchOrgUnits(orgIds = []) {
    const safeOrgIds = Array.isArray(orgIds) ? orgIds : [];
    const validIds = safeOrgIds.filter(id => typeof id === "string" && id.trim() !== "");
    const selectedId = validIds.length > 0 ? validIds[0] : null;

    const variables = useMemo(
        () => (selectedId ? { id: selectedId } : {}),
        [selectedId]
    );

    const dataKey = useMemo(
        () =>
            JSON.stringify({
                type: "orgUnit",
                id: selectedId ?? "__none__",
            }),
        [selectedId]
    );

    const { data: rawData, loading, error, refetch, source } =
        useCacheableQuery(
            "data",
            dataKey,
            ORG_UNIT_QUERY,
            variables,
            !selectedId // lazy only when no ID
        );

    // normalize DHIS2 quirks
    let data = rawData;

    if (rawData?.ou) {
        if (Array.isArray(rawData.ou.organisationUnits)) {
            const found =
                rawData.ou.organisationUnits.find((ou) => ou.id === selectedId) ??
                rawData.ou.organisationUnits[0];

            data = { ou: found };
        }
    }

    return {
        data: selectedId ? data : null,
        loading: selectedId ? loading : false,
        error: selectedId ? error : null,
        selectedId,
        refetch,
        source,
    };
}
