// features/org-units/api/useFetchOrgUnits.jsx
import { useMemo } from "react"
import { useCacheableQuery } from "../../../shared/cache/cacheableQuery"

// Query definition - must be static for DHIS2
const ORG_UNIT_QUERY = {
    ou: {
        resource: "organisationUnits",
        id: ({ id }) => id,
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

export default function useFetchOrgUnits(orgIds = []) {
    const safeOrgIds = Array.isArray(orgIds) ? orgIds : []
    const validIds = safeOrgIds.filter(id => id && typeof id === 'string' && id.trim() !== '')
    const selectedId = validIds.length > 0 ? validIds[0] : null

    const variables = useMemo(
        () => {
            if (!selectedId) {
                return {}
            }
            return {
                id: selectedId,
            }
        },
        [selectedId]
    )

    const dataKey = useMemo(
        () =>
            JSON.stringify({
                type: "orgUnit",
                id: selectedId ?? "__none__",
            }),
        [selectedId]
    )

    // Fetch with cache - checks cache first, fetches if missing
    const {
        data: rawData,
        loading,
        error,
        refetch,
        source,
    } = useCacheableQuery(
        "data",
        dataKey,
        ORG_UNIT_QUERY,
        variables,
        !selectedId // Skip query if no selectedId
    )
    
    // DHIS2 sometimes returns { ou: { organisationUnits: [orgUnit] } } instead of { ou: orgUnit }
    // Extract the actual org unit from the response
    let data = rawData
    if (rawData?.ou) {
        if (rawData.ou.organisationUnits && Array.isArray(rawData.ou.organisationUnits)) {
            if (rawData.ou.organisationUnits.length > 0) {
                const matchingOu = rawData.ou.organisationUnits.find(ou => ou.id === selectedId) 
                    || rawData.ou.organisationUnits[0]
                
                data = {
                    ou: matchingOu
                }
            } else {
                data = { ou: null }
            }
        } else if (rawData.ou.id) {
            // Already the org unit object, use as-is
            data = rawData
        } else {
            console.warn('⚠️ [useFetchOrgUnits] Unexpected data structure:', rawData.ou)
            data = { ou: null }
        }
    }
    
    if (selectedId) {
        console.log('[useFetchOrgUnits]', {
            selectedId,
            hasData: !!data?.ou,
            orgUnitId: data?.ou?.id,
            orgUnitName: data?.ou?.name || data?.ou?.displayName,
            isCluster: !!(data?.ou?.children?.length > 0),
            loading,
            error: error?.message,
            source
        })
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
