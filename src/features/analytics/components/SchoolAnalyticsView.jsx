import React from 'react'
import { useSchoolAnalytics } from '../api/useSchoolAnalytics'
import { useMemo } from 'react'

// Helper hook that wraps the analytics query and returns a clean, sorted data list
export default function SchoolAnalyticsView(schoolId) {
 
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

// // All School Inspection data elements
// const schoolInspectionFields = [
//     { id: 'Nvp4hIbXrzF', label: 'Computer Lab present?', type: 'BOOLEAN' },
//     { id: 'gzhjCMe7OyS', label: 'Computer Lab condition (1–5)', type: 'INTEGER_POSITIVE' },
//     { id: 'IKiSAA19Xvl', label: 'Electricity available?', type: 'BOOLEAN' },
//     { id: 'MH2eDd7qWxR', label: 'Electricity condition (1–5)', type: 'INTEGER_POSITIVE' },
//     { id: 'n9KwS4rY2HC', label: 'Handwashing available?', type: 'BOOLEAN' },
//     { id: 'ie3bFiVatHT', label: 'Handwashing condition (1–5)', type: 'INTEGER_POSITIVE' },
//     { id: 'Y6DQqwTdhiZ', label: 'Library available?', type: 'BOOLEAN' },
//     { id: 'IAomDvMcUDr', label: 'Library condition (1–5)', type: 'NUMBER' },
//     { id: 'ya5SyA5hej4', label: 'Number of classrooms', type: 'NUMBER' },
//     { id: 'XIgpDhDC4Ol', label: 'Number of clean and secure classrooms', type: 'NUMBER' },
//     { id: 'XThfmg6f2oC', label: 'Playground available?', type: 'BOOLEAN' },
//     { id: 'JzZfwXtdL6G', label: 'Playground condition (1–5)', type: 'INTEGER_POSITIVE' },
//     { id: 'I13NTyLrHBm', label: 'Toilets for teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
//     { id: 'QXcKg7GSr4e', label: 'Toilets for boys', type: 'NUMBER' },
//     { id: 'OGmIo4kFUYr', label: 'Toilets for girls', type: 'NUMBER' },
//     { id: 'iytoDmoTUWY', label: 'Total toilets', type: 'INTEGER_ZERO_OR_POSITIVE' },
//     { id: 'DO0LBJfXY00', label: 'Learners (students)', type: 'INTEGER_ZERO_OR_POSITIVE' },
//     { id: 'jcC1uz56IpY', label: 'Number of seats', type: 'INTEGER_ZERO_OR_POSITIVE' },
//     { id: 'LME331J5aev', label: 'Number of teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
// ]

// export default function SchoolAnalyticsView({ schoolId }) {
//     const { data, loading, error } = useSchoolAnalytics({
//         programId: 'UxK2o06ScIe',
//         stageId: 'eJiBjm9Rl7E',
//         schoolId,
//         startDate: '2025-01-01',
//         endDate: '2025-12-31',
//         dataElements: schoolInspectionFields.map(f => f.id),
//     })

//     if (!schoolId) return null
//     if (loading) return <CircularLoader />
//     if (error) return <NoticeBox error title="Error">{error.message}</NoticeBox>

//     const rows = data?.rows ?? []
//     if (rows.length === 0)
//         return <NoticeBox title="No data">No inspection events found for this school.</NoticeBox>

//     return (
//         <div style={{ padding: '1rem' }}>
//             <h3>Inspection Events for {schoolId}</h3>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Event</th>
//                         {schoolInspectionFields.map(field => (
//                             <th key={field.id}>{field.label}</th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {rows.map((row, i) => {
//                         const [eventId, ...values] = row
//                         return (
//                             <tr key={i}>
//                                 <td>{eventId}</td>
//                                 {values.map((value, j) => (
//                                     <td key={j}>{value ?? '-'}</td>
//                                 ))}
//                             </tr>
//                         )
//                     })}
//                 </tbody>
//             </table>
//         </div>
//     )
// }