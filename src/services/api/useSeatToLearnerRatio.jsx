// src/services/api/useSeatToLearnerRatios.js
import { useState, useEffect } from "react"
import { useDataEngine } from "@dhis2/app-runtime"
import { useLearnerCounts } from "./useLearnerCounts"

export function useSeatToLearnerRatios(orgUnitId, period = "2024", levels) {
    const engine = useDataEngine()
    const {
        counts: learnersCount,
        loading: learnersLoading,
        error: learnersError,
    } = useLearnerCounts(orgUnitId, period, levels)

    const [data, setData] = useState({
        ratios: {},
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (!orgUnitId || !levels?.length || learnersLoading) return

        const fetchSeatData = async () => {
            try {
                const queries = levels.reduce((acc, level) => {
                    acc[level.label] = {
                        resource: "analytics.json",
                        params: {
                        dimension: [`dx:${level.seatActualId};dx:${level.seatGoodId}`, `pe:${period}`],
                            filter: `ou:${orgUnitId}`,
                            ouMode: "DESCENDANTS",
                        },
                    }
                    return acc
                }, {})

                const responses = await engine.query(queries)

                const ratios = {}

                for (const level of levels) {
                    const rows = responses[level.label]?.rows || []
                    const seatsActual = Number(rows?.[0]?.[3] || 0)
                    const seatsGood = Number(rows?.[1]?.[3] || 0)
                    const learners = learnersCount[level.label] || 0

                    ratios[level.label] = {
                        actual: seatsActual / (learners || 1),
                        good: seatsGood / (learners || 1),
                        seatsActual,
                        seatsGood,
                        learners,
                    }
                }

                setData({
                    ratios,
                    loading: false,
                    error: null,
                })
            } catch (e) {
                setData({ ratios: {}, loading: false, error: e })
            }
        }

        fetchSeatData()
    }, [engine, orgUnitId, period, levels, learnersCount, learnersLoading])

    return {
        ...data,
        error: learnersError || data.error,
        loading: data.loading || learnersLoading,
    }
}
