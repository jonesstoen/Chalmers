import React, { useState, useMemo } from 'react'
import { Input, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useSchoolsByRegions } from '../services/api/useSchoolsAPI'
/*
export default function SchoolSearchBar({ onSelect }) {
    // Define region IDs once and memoize to prevent re-fetching
    const regionIds = useMemo(() => ['RlPlK44dtoo', 'Bp3y61WbHwn'], [])

    // Fetch all schools under these regions (runs once)
    const { schools, loading, error } = useSchoolsByRegions(regionIds)

    const [query, setQuery] = useState('')

    if (loading) return <CircularLoader />
    if (error)
        return (
            <NoticeBox error title="Error fetching schools">
                {error.message}
            </NoticeBox>
        )

    // Local name-based filtering
    const filtered = schools.filter(s =>
        s.displayName.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div style={{ maxWidth: 500, margin: '1rem auto' }}>
            <Input
                placeholder="Search for a school..."
                value={query}
                onChange={({ value }) => setQuery(value)}
            />

            {query && (
                <div
                    style={{
                        maxHeight: 300,
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        marginTop: 8,
                        background: '#fff',
                        padding: 8,
                    }}
                >
                    {filtered.length === 0 ? (
                        <div style={{ color: '#777' }}>No results</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {filtered.slice(0, 50).map(s => (
                                <li
                                    key={s.id}
                                    onClick={() => onSelect?.(s)}
                                    style={{
                                        padding: '6px 8px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee',
                                    }}
                                    onMouseEnter={e =>
                                        (e.currentTarget.style.background = '#f5f5f5')
                                    }
                                    onMouseLeave={e =>
                                        (e.currentTarget.style.background = 'transparent')
                                    }
                                >
                                    {s.displayName}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
*/