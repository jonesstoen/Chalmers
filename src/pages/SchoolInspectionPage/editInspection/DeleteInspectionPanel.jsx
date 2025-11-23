// pages/SchoolInspectionPage/editInspection/DeleteInspectionPanel.jsx
import React from 'react'
import { Button, NoticeBox } from '@dhis2/ui'
import { useDeleteSchoolInspectionEvent } from './hooks/useDeleteSchoolInspection'
export default function DeleteInspectionPanel({ event }) {
    const [deleteEvent, { loading, error }] = useDeleteSchoolInspectionEvent()

    if (!event) {
        return <NoticeBox title="Select an event">Pick an event in the table above to delete.</NoticeBox>
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete event ${event.psi}? This cannot be undone.`)) return
        await deleteEvent({ eventId: event.psi })
        alert('Event deleted.')
    }

    return (
        <div style={{ border: '1px solid #fee2e2', background: '#fff', borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Delete inspection</h3>
            <p><strong>Event ID:</strong> {event.psi}</p>
            <Button destructive onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting…' : 'Delete'}
            </Button>
            {error && <p style={{ color: 'crimson' }}>Error: {error.message}</p>}
        </div>
    )
}