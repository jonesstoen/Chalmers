import React, { useState, useMemo } from 'react'
import { Input, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useSchoolsByRegions } from '../../../shared/api/useSchoolsAPI'
import {
    IconWorld16,
    IconFolder16,
    IconHome16
} from '@dhis2/ui'
import styles from './SchoolSearchBar.module.css'


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
        <div className={styles.container}>
            <Input
                placeholder="Search for a school or cluster..."
                value={query}
                onChange={({ value }) => setQuery(value)}
                dense={false}
                aria-label="Search for schools or clusters"
            />

            {query && (
                <div
                    className={styles.dropdown}
                    role="listbox"
                    aria-label="Search results"
                >
                    {/* Legend */}
                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <IconWorld16 color="#1f6fe5" /> Region
                        </div>
                        <div className={styles.legendItem}>
                            <IconFolder16 color="#DE683D" /> Cluster
                        </div>
                        <div className={styles.legendItem}>
                            <IconHome16 color="#2e7d32" /> School
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className={styles.noResults}>
                            No results found
                        </div>
                    ) : (
                        <ul className={styles.resultsList}>
                            {filtered.slice(0, 50).map(s => (
                                <li
                                    key={s.id}
                                    onClick={() => {
                                        onSelect?.(s)
                                        setQuery('')
                                    }}
                                    className={styles.resultItem}
                                    role="option"
                                    aria-label={`${s.displayName} (${typeLabel(s.type)})`}
                                >
                                    <div className={styles.iconContainer}>
                                        {getIcon(s.type)}
                                    </div>

                                    <span className={styles.resultText}>
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
