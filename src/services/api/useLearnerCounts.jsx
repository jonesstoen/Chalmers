// src/services/api/useLearnerCounts.js
import { useState, useEffect } from "react"
import { useDataEngine } from "@dhis2/app-runtime"

// SCHOOL_LEVELS is imported from your config
// [
//   { label: 'UBE', seatActualId: '...', seatGoodId: '...', learnerId: '...' },
//   { label: 'LBE', ... },
//   { label: 'SSE', ... }
// ]

export function useLearnerCounts(orgUnitId, period = "2024", levels) {
    const engine = useDataEngine()
    const [data, setData] = useState({
        counts: {},
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (!orgUnitId || !levels?.length) return

        const fetchData = async () => {
            try {
                // Build one query per level based on learnerId
                const queries = levels.reduce((acc, level) => {
                    acc[level.label] = {
                        resource: "analytics.json",
                        params: {
                            dimension: [`dx:${level.learnerId}`, `pe:${period}`],
                            filter: `ou:${orgUnitId}`,
                            ouMode: "DESCENDANTS",
                        },
                    }
                    return acc
                }, {})

                // Execute all API calls in parallel
                const responses = await engine.query(queries)

                // Extract learner counts
                const counts = {}
                for (const level of levels) {
                    const rows = responses[level.label]?.rows
                    const total = Number(rows?.[0]?.[3] || 0)
                    counts[level.label] = total
                }

                setData({ counts, loading: false, error: null })
            } catch (e) {
                setData({ counts: {}, loading: false, error: e })
            }
        }

        fetchData()
    }, [engine, orgUnitId, period, levels])

    return data
}
