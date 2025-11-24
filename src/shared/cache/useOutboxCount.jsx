import { useState, useEffect } from 'react'
import { outboxCache } from './config'

/**
 * Hook to count items in the outbox cache
 * Returns the count of pending items that need to be synced
 */
export function useOutboxCount() {
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        let intervalId = null

        const updateCount = async () => {
            try {
                const keys = await outboxCache.keys()
                // Filter for event keys (they start with "event:")
                const eventKeys = keys.filter(key => 
                    typeof key === 'string' && key.startsWith('event:')
                )
                
                if (!cancelled) {
                    setCount(eventKeys.length)
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error counting outbox items:', error)
                if (!cancelled) {
                    setCount(0)
                    setLoading(false)
                }
            }
        }

        // Initial count
        updateCount()

        // Poll every 2 seconds to keep count updated
        intervalId = setInterval(updateCount, 2000)

        return () => {
            cancelled = true
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [])

    return { count, loading }
}

