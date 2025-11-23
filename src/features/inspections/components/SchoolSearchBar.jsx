import React, { useState, useMemo } from 'react'
import { Input, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useSchoolsByRegions } from '../../inspections/hooks/useSchoolsAPi'
import {
    IconWorld16,
    IconFolder16,
    IconHome16
} from '@dhis2/ui'


export default function SchoolSearchBar({ onSelect}) {
    const regionIds = useMemo(() => ['RlPlK44dtoo', 'Bp3y61WbHwn'], [])

    const { schools, loading, error } = useSchoolsByRegions(regionIds)
    const [query, setQuery] = useState('')

    if (loading) return <CircularLoader />
    if (error) {
        return (
            <NoticeBox error title="Error fetching schools">
                {error.message}
            </NoticeBox>
        )
    }

    const filtered = schools.filter(s =>
        s.displayName?.toLowerCase().includes(query.toLowerCase())
    )
const getIcon = type => {
    if (type === 'region') {
        return <IconWorld16 color={typeColor(type)} />
    }
    if (type === 'cluster') {
        return <IconFolder16 color={typeColor(type)} />
    }
    return <IconHome16 color={typeColor(type)} /> // school
}

    const typeColor = type => {
        if (type === 'region') return '#1f6fe5'   // blue
        if (type === 'cluster') return '#DE683D'  // orange
        return '#2e7d32'                          // green for schools
    }

    const typeLabel = type => {
        if (type === 'region') return 'Region'
        if (type === 'cluster') return 'Cluster'
        return 'School'
    }

    return (
        
        <div style={{ width: '100%', position: 'relative' }}>
            <Input
                placeholder="Search for a school or cluster..."
                value={query}
                onChange={({ value }) => setQuery(value)}
                dense={false}
                aria-label="Search for schools or clusters"
            />

       {query && (
    <div
        style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflowY: 'auto',
            border: '2px solid #e5e7eb',
            borderRadius: 8,
            marginTop: 8,
            background: '#fff',
            padding: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        role="listbox"
        aria-label="Search results"
    >
        {/* Legend */}
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '8px 0 12px',
                fontSize: 12,
                color: '#64748b',
                borderBottom: '2px solid #e5e7eb',
                marginBottom: 12,
                flexWrap: 'wrap',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconWorld16 color="#1f6fe5" /> Region
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconFolder16 color="#DE683D" /> Cluster
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconHome16 color="#2e7d32" /> School
            </div>
        </div>

        {filtered.length === 0 ? (
            <div style={{ 
                color: '#64748b', 
                padding: '16px',
                textAlign: 'center',
                fontSize: 14,
            }}>
                No results found
            </div>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filtered.slice(0, 50).map(s => (
                    <li
                        key={s.id}
                        onClick={() => {
                            onSelect?.(s)
                            setQuery('')
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff'
                        }}
                        style={{
                            padding: '12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            minHeight: 44, // Mobile touch target
                            transition: 'background 0.15s ease',
                        }}
                        role="option"
                        aria-label={`${s.displayName} (${typeLabel(s.type)})`}
                    >
                        <div style={{ 
                            width: 24, 
                            height: 24, 
                            display: 'flex', 
                            alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            {getIcon(s.type)}
                        </div>

                        <span style={{ 
                            flex: 1, 
                            lineHeight: '20px',
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#0f172a',
                        }}>
                            {s.displayName}
                        </span>
                    </li>
                ))}
            </ul>
        )}
    </div>
)}

        </div>
    )
}
