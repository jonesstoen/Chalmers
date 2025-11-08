import { useEffect, useMemo } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import {useCacheableQuery} from '../cache/cacheableQuery'
// One static query. We substitute {id} at fetch time.
const BASE_QUERY = {
    ou: {
        resource: 'organisationUnits',
        id: ({ id }) => id, // -> organisationUnits/{id}
        params: {
            fields: [
                'id',
                'name',
                'displayName',
                'level',
                'parent[id,name]',
                'children[id,name]',
                'programs[id,name,programStages[id,name,displayName]]',
                'dataSets[id,name]',
            ].join(','),
        },
    },
}

export default function useFetchOrgUnits(orgIds) {
    const selectedId = Array.isArray(orgIds) && orgIds.length ? orgIds[0] : null

    // keep the query object stable
    const query = useMemo(() => BASE_QUERY, [])

    // lazy so we control when it fires
    const { data, loading, error, refetch } = useDataQuery(query, { lazy: true })

    // trigger fetch each time selection changes
    useEffect(() => {
        if (selectedId) {
            refetch({ id: selectedId })
        }
    }, [selectedId, refetch])

    return { data, loading, error, selectedId }
}
