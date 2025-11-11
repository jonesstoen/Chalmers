import React, { useState } from 'react'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import useSchoolAnalyticsWrapper from './SchoolAnalyticsView'

// Define all data elements
const schoolInspectionFields = [
    { id: 'Nvp4hIbXrzF', label: 'Computer Lab present?' },
    { id: 'gzhjCMe7OyS', label: 'Computer Lab condition (1–5)' },
    { id: 'IKiSAA19Xvl', label: 'Electricity available?' },
    { id: 'MH2eDd7qWxR', label: 'Electricity condition (1–5)' },
    { id: 'n9KwS4rY2HC', label: 'Handwashing available?' },
    { id: 'ie3bFiVatHT', label: 'Handwashing condition (1–5)' },
    { id: 'Y6DQqwTdhiZ', label: 'Library available?' },
    { id: 'IAomDvMcUDr', label: 'Library condition (1–5)' },
    { id: 'ya5SyA5hej4', label: 'Number of classrooms' },
    { id: 'XIgpDhDC4Ol', label: 'Number of clean and secure classrooms' },
    { id: 'XThfmg6f2oC', label: 'Playground available?' },
    { id: 'JzZfwXtdL6G', label: 'Playground condition (1–5)' },
    { id: 'I13NTyLrHBm', label: 'Toilets for teachers' },
    { id: 'QXcKg7GSr4e', label: 'Toilets for boys' },
    { id: 'OGmIo4kFUYr', label: 'Toilets for girls' },
    { id: 'iytoDmoTUWY', label: 'Total toilets' },
    { id: 'DO0LBJfXY00', label: 'Learners (students)' },
    { id: 'jcC1uz56IpY', label: 'Number of seats' },
    { id: 'LME331J5aev', label: 'Number of teachers' },
]

export default function InspectionTimeline({ schoolId, onSelect }) {
    const { events, loading, error } = useSchoolAnalyticsWrapper(schoolId)

    const [sortKey, setSortKey] = useState('eventdate')
    const [sortAsc, setSortAsc] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)

    if (!schoolId) return null
    if (loading) return <CircularLoader />
    if (error) return <NoticeBox error title="Error">{error.message}</NoticeBox>
    if (events.length === 0) return <NoticeBox title="No data">No inspection events found.</NoticeBox>

    // Sort logic
    const sortedEvents = [...events].sort((a, b) => {
        const valA = a[sortKey] ?? ''
        const valB = b[sortKey] ?? ''
        const comp = valA > valB ? 1 : valA < valB ? -1 : 0
        return sortAsc ? comp : -comp
    })

    const toggleSort = (key) => {
        if (sortKey === key) setSortAsc(!sortAsc)
        else {
            setSortKey(key)
            setSortAsc(true)
        }
    }

    const handleRowClick = (event) => {
        setSelectedEvent(event)
        onSelect?.(event)
    }

    return (
        <div style={{ padding: '1rem', overflowX: 'auto' }}>
            <h3>Inspection Events for {schoolId}</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th onClick={() => toggleSort('psi')} style={headerStyle}>Event</th>
                        <th onClick={() => toggleSort('eventdate')} style={headerStyle}>Event date</th>
                        <th onClick={() => toggleSort('eventstatus')} style={headerStyle}>Status</th>
                        {schoolInspectionFields.map(field => (
                            <th
                                key={field.id}
                                onClick={() => toggleSort(field.id)}
                                style={headerStyle}
                            >
                                {field.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedEvents.map((e, i) => (
                        <tr
                            key={i}
                            onClick={() => handleRowClick(e)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedEvent?.psi === e.psi ? '#f0f0f0' : 'transparent'
                            }}
                        >
                            <td style={cellStyle}>{e.psi}</td>
                            <td style={cellStyle}>{new Date(e.eventdate).toLocaleDateString()}</td>
                            <td style={cellStyle}>{e.eventstatus}</td>
                            {schoolInspectionFields.map(field => (
                                <td key={field.id} style={cellStyle}>
                                    {e[field.id] ?? '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedEvent && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h4>Selected Event Details</h4>
                    <p><strong>ID:</strong> {selectedEvent.psi}</p>
                    <p><strong>Date:</strong> {new Date(selectedEvent.eventdate).toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedEvent.eventstatus}</p>
                </div>
            )}
        </div>
    )
}

// styling helpers
const headerStyle = {
    borderBottom: '1px solid #ccc',
    textAlign: 'left',
    padding: '4px',
    cursor: 'pointer',
    userSelect: 'none',
}

const cellStyle = {
    padding: '4px',
    borderBottom: '1px solid #eee',
}
