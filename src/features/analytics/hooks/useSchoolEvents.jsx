import React from 'react'
import { useSchoolAnalytics } from '../components/useSchoolAnalytics'
import { useMemo } from 'react'

// Helper hook that wraps the analytics query and returns a clean, sorted data list
export default function UseSchoolEvents(schoolId) {

    const { data, loading, error } = useSchoolAnalytics({
        programId: 'UxK2o06ScIe',
        stageId: 'eJiBjm9Rl7E',
        schoolId,
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        dataElements: [
            'Nvp4hIbXrzF', // Computer Lab present?
            'gzhjCMe7OyS', // Computer Lab condition
            'IKiSAA19Xvl', // Electricity available?
            'MH2eDd7qWxR', // Electricity condition
            'n9KwS4rY2HC', // Handwashing available?
            'ie3bFiVatHT', // Handwashing condition
            'Y6DQqwTdhiZ', // Library available?
            'IAomDvMcUDr', // Library condition
            'ya5SyA5hej4', // Classrooms
            'XIgpDhDC4Ol', // Clean classrooms
            'XThfmg6f2oC', // Playground available?
            'JzZfwXtdL6G', // Playground condition
            'I13NTyLrHBm', // Toilets for teachers
            'QXcKg7GSr4e', // Toilets for boys
            'OGmIo4kFUYr', // Toilets for girls
            'iytoDmoTUWY', // Total toilets
            'DO0LBJfXY00', // Learners
            'jcC1uz56IpY', // Seats
            'LME331J5aev', // Teachers
        ],
    })

    // Transform raw rows + headers into structured objects
    const events = useMemo(() => {
        if (!data?.rows?.length) return []

        const headers = data.headers.map(h => h.name)
        const eventDateIndex = headers.indexOf('eventdate')

        const parsed = data.rows.map(row => {
            const obj = {}
            headers.forEach((key, i) => {
                obj[key] = row[i]
            })
            return obj
        })

        // Sort by event date ascending
        return parsed.sort((a, b) => {
            const da = new Date(a.eventdate || 0)
            const db = new Date(b.eventdate || 0)
            return da - db
        })
    }, [data])

    return { events, loading, error }
}