// pages/SchoolInspectionPage/editInspection/DeleteInspectionPanel.jsx
import React from 'react'
import { Button, NoticeBox } from '@dhis2/ui'
import { useDeleteSchoolInspectionEvent } from './hooks/useDeleteSchoolInspection'
import styles from './DeleteInspectionPanel.module.css'
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
        <div className={styles.container}>
            <h3 className={styles.title}>Delete inspection</h3>
            <p><strong>Event ID:</strong> {event.psi}</p>
            <Button destructive onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting…' : 'Delete'}
            </Button>
            {error && <p className={styles.error}>Error: {error.message}</p>}
        </div>
    )
}