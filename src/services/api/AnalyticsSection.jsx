import React from 'react'
import useFetchAnalytics from './analyticsAPI'

export default function AnalyticsSection() {
    // Request the Learners element (DO0LBJfXY00)
    const { data, loading, error } = useFetchAnalytics(
        'UxK2o06ScIe', // School Inspection
        { 
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            stage: 'eJiBjm9Rl7E'
        },
        [
            { itemid: 'DO0LBJfXY00', operator: 'GT', filter: '0' } // include Learners column
        ],
        ['Bp3y61WbHwn'],
        true // DESCENDANTS
    )

    if (loading) return <p>Loading learner analytics…</p>
    if (error) return <p>Error: {error.message}</p>

    const headers = data?.analytics?.headers || []
    const rows = data?.analytics?.rows || []

    // find the column that corresponds to Learners
    const learnerIndex = headers.findIndex(h => h.name === 'DO0LBJfXY00')
    const totalLearners = rows.reduce(
        (sum, row) => sum + Number(row[learnerIndex] || 0),
        0
    )

    return (
        <div style={{ marginTop: '1rem', background: '#eef6ff', padding: '1rem', borderRadius: 8 }}>
            <h3>Total Learners (aggregated across descendants)</h3>
            <p>{totalLearners > 0 ? totalLearners : 'No learner data found'}</p>
        </div>
    )
}
