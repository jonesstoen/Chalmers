import { useMemo } from 'react'
import useFetchAggregatedAnalytics from '../api/useFetchAggregatedAnalytics'
import dayjs from 'dayjs'

export function useAggregatedSchoolAnalytics({
    schoolId,
    startDate = '2024-01-01',
    endDate = new Date().toISOString().split('T')[0],
    dataElementIds = [],
    includeDescendants = false,
    filters = [],
}) {
    const programId = 'UxK2o06ScIe'
    const stageId = 'eJiBjm9Rl7E'

    const queryParams = useMemo(
        () => ({
            stage: stageId,
            startDate,
            endDate,
            dimensions: [ ...dataElementIds],
        }),
        [stageId, startDate, endDate, dataElementIds]
    )

    const { data, loading, error } = useFetchAggregatedAnalytics(
        programId,
        queryParams,
        filters,
        [schoolId],
        { descendants: includeDescendants, paging: false }
    )

    const timeSeries = useMemo(() => {
        const analytics = data?.analytics ?? data
        if (!analytics?.rows?.length || !analytics?.headers?.length) return []

        const headers = analytics.headers
        const rows = analytics.rows
        const eventDateIdx = headers.findIndex(h => h.name === 'eventdate')
        const valueIdx = headers.findIndex(h => h.name === dataElementIds[0])

        if (eventDateIdx === -1 || valueIdx === -1) return []

        const buckets = {}
        for (const r of rows) {
            const month = dayjs(r[eventDateIdx]).format('YYYY-MM')
            const val = Number(r[valueIdx] ?? 0)
            buckets[month] = (buckets[month] ?? 0) + val
        }

        return Object.entries(buckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([period, value]) => ({ period, value }))
    }, [data, dataElementIds])

    return { data, loading, error, timeSeries }
}
