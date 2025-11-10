import { useEffect, useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

export function useSchoolsByRegions(regionIds = []) {
    const engine = useDataEngine()
    const [schools, setSchools] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!regionIds.length) return

        async function fetchAndMergeSchools() {
            setLoading(true)
            setError(null)

            try {
                // Run a separate query for each region in parallel
                const queries = regionIds.map((id) =>
                    engine.query({
                        schools: {
                            resource: 'organisationUnits',
                            params: {
                                filter: [`path:like:${id}`],
                                fields: 'id,displayName,level,children[id]',
                                paging: false,
                            },
                        },
                    })
                )

                const results = await Promise.all(queries)

                // Flatten and merge results
                const allUnits = results.flatMap(
                    (r) => r.schools.organisationUnits || []
                )

                // Keep only leaf nodes (actual schools)
                const leafNodes = allUnits.filter(
                    (u) => !u.children || u.children.length === 0
                )

                setSchools(leafNodes)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchAndMergeSchools()
    }, [engine, regionIds])

    return { schools, loading, error }
}
