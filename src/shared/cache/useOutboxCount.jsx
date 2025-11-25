import { useState, useEffect, useCallback } from 'react'
import { outboxCache } from './config'
import { outboxEvents } from './outboxEvents'

export function useOutboxCount() {
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const updateCount = useCallback(async () => {
        try {
            const keys = await outboxCache.keys()
            const eventKeys = keys.filter(key =>
                typeof key === 'string' && key.startsWith('event:')
            )
            setCount(eventKeys.length)
            setLoading(false)
        } catch (err) {
            console.error('Error counting outbox items:', err)
            setCount(0)
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        updateCount() // initial count

        outboxEvents.on('changed', updateCount)

        return () => outboxEvents.off('changed', updateCount)
    }, [updateCount])

    return { count, loading }
}