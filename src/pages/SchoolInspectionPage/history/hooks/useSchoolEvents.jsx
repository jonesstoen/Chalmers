import { useMemo } from 'react'
import { useSchoolAnalytics } from '../components/useSchoolAnalytics'

// Helper hook that wraps analytics and returns structured events
export default function UseSchoolEvents(schoolId) {

    const { data, loading, error } = useSchoolAnalytics({
        programId: 'UxK2o06ScIe',
        stageId: 'eJiBjm9Rl7E',
        schoolId,
        startDate: '2024-01-01',
        endDate: '2025-12-31',  // intentional fixed window
        dataElements: [
            'Nvp4hIbXrzF',
            'gzhjCMe7OyS',
            'IKiSAA19Xvl',
            'MH2eDd7qWxR',
            'n9KwS4rY2HC',
            'ie3bFiVatHT',
            'Y6DQqwTdhiZ',
            'IAomDvMcUDr',
            'ya5SyA5hej4',
            'XIgpDhDC4Ol',
            'XThfmg6f2oC',
            'JzZfwXtdL6G',
            'I13NTyLrHBm',
            'QXcKg7GSr4e',
            'OGmIo4kFUYr',
            'iytoDmoTUWY',
            'DO0LBJfXY00',
            'jcC1uz56IpY',
            'LME331J5aev',
        ],
    })

    // Transform rows to structured event objects
    const events = useMemo(() => {
        if (!data?.rows?.length) return []

        const headers = data.headers.map(h => h.name)

        const parsed = data.rows.map(row => {
            const obj = {}
            headers.forEach((key, i) => {
                obj[key] = row[i]
            })
            return obj
        })

        return parsed.sort((a, b) =>
            new Date(a.eventdate || 0) - new Date(b.eventdate || 0)
        )
    }, [data])

    return { events, loading, error }
}
