// features/home/LandingPage.jsx
import React, { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataQuery } from '@dhis2/app-runtime'
import { Button, NoticeBox, Chip, CircularLoader, Help } from '@dhis2/ui'
import useFetchAnalytics from '../analytics/api/analyticsAPI'
import SyncBanner from './SyncBanner'
import MetricTile from './MetricTile'
import PrioritySchoolCard from './PrioritySchoolCard'

// --- Config ---
const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID   = 'eJiBjm9Rl7E'
const ROOTS = [
    { id: 'Bp3y61WbHwn', label: 'Kanifing' },
    { id: 'RlPlK44dtoo', label: 'Banjul' },
]
const RATIO_THRESHOLD = 0.7

function monthRangeISO(d = new Date()) {
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const iso = x => x.toISOString().slice(0, 10)
    return { startDate: iso(start), endDate: iso(end) }
}

export default function LandingPage() {
    const navigate = useNavigate()
    const openInspector  = () => navigate('/inspect')
    const openRoot       = (id) => navigate(`/inspect?root=${id}`)
    const openSchool     = (id) => navigate(`/inspect?ou=${id}`)

    const lastOu = typeof window !== 'undefined'
        ? window.localStorage.getItem('lastOu')
        : null

    // ======== Analytics snapshot (for KPI + “Analytics” kort) ========
    const { startDate, endDate } = useMemo(() => monthRangeISO(), [])
    const { data, loading, error } = useFetchAnalytics(
        PROGRAM_ID,
        { startDate, endDate, stage: STAGE_ID },
        [],
        ROOTS.map(r => r.id),
        { descendants: true, paging: false }
    )
    const headers = data?.analytics?.headers ?? []
    const rows    = data?.analytics?.rows ?? []
    const inspectionsThisMonth = rows.length

    // Finn “priority schools”
    const [priorityOuIds, setPriorityOuIds] = useState([])
    useEffect(() => {
        if (!rows.length || !headers.length) return setPriorityOuIds([])
        const ouIdx       = headers.findIndex(h => h.name === 'ou')
        const learnersIdx = headers.findIndex(h => h.name === 'DO0LBJfXY00')
        const seatsIdx    = headers.findIndex(h => h.name === 'jcC1uz56IpY')
        if (ouIdx < 0 || learnersIdx < 0 || seatsIdx < 0) return setPriorityOuIds([])

        const byOu = new Map()
        for (const r of rows) {
            const ou = r[ouIdx]
            const learners = Number(r[learnersIdx] || 0)
            const seats    = Number(r[seatsIdx] || 0)
            const agg = byOu.get(ou) ?? { learners: 0, seats: 0 }
            agg.learners += isNaN(learners) ? 0 : learners
            agg.seats    += isNaN(seats) ? 0 : seats
            byOu.set(ou, agg)
        }
        const bad = []
        for (const [ou, { learners, seats }] of byOu.entries()) {
            if (learners > 0 && seats / learners < RATIO_THRESHOLD) bad.push({ ou, ratio: seats / learners })
        }
        bad.sort((a,b) => a.ratio - b.ratio)
        setPriorityOuIds(bad.slice(0, 8).map(x => x.ou))
    }, [rows, headers])

    const ouBatchQuery = useMemo(() => {
        if (!priorityOuIds.length) return null
        return {
            ous: {
                resource: 'organisationUnits',
                params: {
                    filter: `id:in:[${priorityOuIds.join(',')}]`,
                    fields: 'id,name,displayName,parent[name]',
                    paging: false,
                },
            },
        }
    }, [priorityOuIds])
    const { data: ouData } = useDataQuery(ouBatchQuery ?? {}, { lazy: !ouBatchQuery })
    const ouList = ouData?.ous?.organisationUnits ?? []

    // ======== Søk på dashboardet (Discoverability) ========
    const [term, setTerm] = useState('')
    const [debounced, setDebounced] = useState('')
    useEffect(() => {
        const t = setTimeout(() => setDebounced(term.trim()), 300)
        return () => clearTimeout(t)
    }, [term])

    const searchQuery = useMemo(() => ({
        ous: {
            resource: 'organisationUnits',
            params: ({ q }) => ({
                filter: [`name:ilike:${q}`],
                fields: 'id,name,displayName,parent[name],path',
                paging: true, pageSize: 10,
            }),
        },
    }), [])
    const {
        data: searchData,
        refetch: refetchSearch,
        loading: searchLoading,
        error: searchError
    } = useDataQuery(searchQuery, { lazy: true })

    useEffect(() => {
        if (debounced.length >= 2) void refetchSearch({ q: debounced })
    }, [debounced, refetchSearch])

    const results = searchData?.ous?.organisationUnits ?? []

    // Recent schools (chips)
    const [recent, setRecent] = useState(() => {
        try { return JSON.parse(localStorage.getItem('recentOus') || '[]') } catch { return [] }
    })
    const addRecent = (ou) => {
        try {
            const next = [{ id: ou.id, name: ou.displayName || ou.name, parent: ou.parent?.name }, ...recent.filter(x => x.id !== ou.id)].slice(0, 6)
            setRecent(next)
            localStorage.setItem('recentOus', JSON.stringify(next))
        } catch {}
    }

    const onPickSearch = (ou) => {
        addRecent(ou)
        openSchool(ou.id)
    }

    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter' && results.length > 0) {
            onPickSearch(results[0])
        }
    }

    const pendingSync = 0

    // --- Responsive helpers (CSS-in-JS via grid auto-fit) ---
    const threeCol = 'repeat(auto-fit, minmax(260px, 1fr))'

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Dashboard</h2>
            <SyncBanner />

            {/* HERO: tre valg (Start inspection / Find a school / Analytics) */}
            <section
                style={{
                    marginTop: 16,
                    padding: 16,
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc',
                    borderRadius: 12,
                    display: 'grid',
                    gridTemplateColumns: threeCol,
                    gap: 12
                }}
            >
                {/* 1) Start inspection */}
                <div style={{ border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', padding:16 }}>
                    <div style={{ fontWeight:700, marginBottom:6 }}>Start inspection</div>
                    <p style={{ marginTop:0, color:'#475569' }}>
                        Browse the organisation tree, open a school, and submit the inspection form.
                    </p>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <Button primary onClick={openInspector}>Open inspector</Button>
                        <Button onClick={() => openRoot('Bp3y61WbHwn')}>Kanifing root</Button>
                        <Button onClick={() => openRoot('RlPlK44dtoo')}>Banjul root</Button>
                        {lastOu && (
                            <Button secondary onClick={() => openSchool(lastOu)}>Resume last school</Button>
                        )}
                    </div>

                    {recent.length > 0 && (
                        <>
                            <Help style={{ marginTop:12 }}>Recent schools</Help>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {recent.map(r => (
                                    <Chip key={r.id} onClick={() => openSchool(r.id)}>
                                        {r.name}
                                    </Chip>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 2) Find a school (søkeboks) */}
                <div style={{ border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', padding:16 }}>
                    <div style={{ fontWeight:700, marginBottom:6 }}>Find a school</div>
                    <input
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        placeholder="Search schools (min. 2 letters)…"
                        aria-label="Search schools"
                        aria-describedby="search-hint"
                        style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8 }}
                    />
                    <small id="search-hint" style={{ color:'#64748b' }}>
                        Type at least 2 letters to search. Press Enter to open the first match.
                    </small>

                    <div style={{ marginTop:8, maxHeight:220, overflow:'auto' }}>
                        {debounced && searchLoading && (
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <CircularLoader small /> <span>Searching…</span>
                            </div>
                        )}
                        {debounced && searchError && (
                            <NoticeBox error title="Search error" style={{ marginTop:8 }}>
                                {searchError.message}
                            </NoticeBox>
                        )}
                        {debounced && !searchLoading && results.length === 0 && (
                            <div style={{ color:'#64748b' }}>No matches</div>
                        )}
                        {results.map(ou => (
                            <div
                                key={ou.id}
                                onClick={() => onPickSearch(ou)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onPickSearch(ou)}
                                style={{ padding:'8px 10px', borderBottom:'1px solid #f1f5f9', cursor:'pointer' }}
                            >
                                <div style={{ fontWeight:600 }}>{ou.displayName || ou.name}</div>
                                <div style={{ fontSize:12, color:'#64748b' }}>{ou.parent?.name ?? '—'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3) Analytics snapshot */}
                <div style={{ border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', padding:16 }}>
                    <div style={{ fontWeight:700, marginBottom:6 }}>Analytics snapshot</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8 }}>
                        <MetricTile title="Inspections this month" value={loading ? '…' : String(inspectionsThisMonth)} />
                        <MetricTile title="Pending sync"            value={String(pendingSync)} />
                    </div>
                    {error && (
                        <NoticeBox error title="Analytics error" style={{ marginTop:8 }}>
                            {error.message}
                        </NoticeBox>
                    )}
                </div>
            </section>

            {/* Priority schools */}
            <section style={{ marginTop: 16 }}>
                <h3>Priority schools</h3>
                {!loading && ouList.length === 0 && (
                    <p>No priority schools detected this month.</p>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
                    {ouList.map(ou => (
                        <PrioritySchoolCard
                            key={ou.id}
                            name={ou.displayName || ou.name}
                            district={ou.parent?.name ?? '—'}
                            status="Low seat-to-learner ratio"
                            onOpen={() => openSchool(ou.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}