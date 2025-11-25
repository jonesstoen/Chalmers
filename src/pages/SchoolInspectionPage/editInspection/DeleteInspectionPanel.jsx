import React, { useState } from 'react'
import { Button, NoticeBox, AlertStack, AlertBar } from '@dhis2/ui'
import { useDeleteSchoolInspectionEvent } from './hooks/useDeleteSchoolInspection'
import styles from './DeleteInspectionPanel.module.css'
export default function DeleteInspectionPanel({ event }) {
    const [deleteEvent, { loading, error }] = useDeleteSchoolInspectionEvent()
    const [offlineMessage, setOfflineMessage] = useState(null)

    if (!event) {
        return <NoticeBox title="Select an event">Pick an event in the table above to delete.</NoticeBox>
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete event ${event.psi}? This cannot be undone.`)) return
        const result = await deleteEvent({ eventId: event.psi })
        // Handle offline response
        if (result?.isOnline === false) {
            setOfflineMessage(result?.message || 'Cannot delete when offline. Try again later')
        } else {
            setOfflineMessage(null)
            alert('Event deleted.')
        }
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Delete inspection</h3>
            <p><strong>Event ID:</strong> {event.psi}</p>
            <Button destructive onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting…' : 'Delete'}
            </Button>
            {offlineMessage && (
                <AlertStack>
                    <AlertBar warning duration={8000}>
                        <div>
                            <strong>Cannot delete when offline</strong>
                            <div>
                                {offlineMessage}
                            </div>
                        </div>
                    </AlertBar>
                </AlertStack>
            )}
            {error && <p className={styles.error}>Error: {error.message}</p>}
        </div>
    )
}