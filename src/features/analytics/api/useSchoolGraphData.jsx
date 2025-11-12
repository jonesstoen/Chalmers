import { useMemo } from 'react'
import { useSchoolAnalytics } from './useSchoolAnalytics'

export function useSchoolGraphData(options) {
    const { loading, error, data } = useSchoolAnalytics(options)

    const graphData = useMemo(() => {
        if (!data?.rows?.length || !data?.headers?.length) return []

        // Find column indices
        const valueIndex = data.headers.length - 1
        const labelIndex = data.headers.findIndex(h => h.name === 'eventdate')

        if (labelIndex === -1) {
            console.warn('eventdate column not found in analytics response')
            return []
        }

        // Map and convert each row
        const points = data.rows
            .map(row => {
                const dateValue = row[labelIndex]
                const numericValue = Number(row[valueIndex])
                if (!dateValue || isNaN(numericValue)) return null
                return {
                    date: new Date(dateValue),
                    label: new Date(dateValue).toLocaleDateString('en-GB'), // formatted date for display
                    value: numericValue,
                }
            })
            .filter(Boolean) // remove nulls
            .sort((a, b) => a.date - b.date) // chronological order

        // Return only label/value pairs for the chart
        return points.map(p => ({
            label: p.label,
            value: p.value,
        }))
    }, [data])

    return { loading, error, graphData }
}
