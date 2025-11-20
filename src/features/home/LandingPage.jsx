// features/home/LandingPage.jsx
import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataQuery } from '@dhis2/app-runtime'
import useFetchAnalytics from '../analytics/api/analyticsAPI'
import SyncBanner from './SyncBanner'
import MetricTile from './MetricTile'
import PrioritySchoolCard from './PrioritySchoolCard'
import InspectionTimeline from '../analytics/components/InspectionTimeline'

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID = 'eJiBjm9Rl7E'
const ROOTS = [
    { id: 'Bp3y61WbHwn', label: 'Kanifing' },
    { id: 'RlPlK44dtoo', label: 'Banjul' },
]
const RATIO_THRESHOLD = 0.7

function monthRangeISO(d = new Date()) {
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const iso = x => x.toISOString().slice(0, 10)
    return { startDate: iso(start), endDate: iso(end) }
}

export default function LandingPage() {
    const navigate = useNavigate()

    // Åpne inspektør for en gitt skole (bruker ?ou= og /school-inspection)
    const openSchool = useCallback(
        ouId => navigate(`/school-inspection?ou=${ouId}`),
        [navigate]
    )

    const openSchoolInspection = useCallback(
        () => navigate('/school-inspection'),
        [navigate]
    )

    const lastOu =
        typeof window !== 'undefined'
            ? window.localStorage.getItem('lastOu')
            : null

    const { startDate, endDate } = useMemo(() => monthRangeISO(), [])

    const { data, loading, error } = useFetchAnalytics(
        PROGRAM_ID,
        { startDate, endDate, stage: STAGE_ID },
        [],
        ROOTS.map(r => r.id),
        { descendants: true, paging: false }
    )

    const headers = data?.analytics?.headers ?? []
    const rows = data?.analytics?.rows ?? []
    const inspectionsThisMonth = rows.length

    const [priorityOuIds, setPriorityOuIds] = useState([])

    useEffect(() => {
        if (!rows.length || !headers.length) return setPriorityOuIds([])

        const ouIdx = headers.findIndex(h => h.name === 'ou')
        const learnersIdx = headers.findIndex(h => h.name === 'DO0LBJfXY00')
        const seatsIdx = headers.findIndex(h => h.name === 'jcC1uz56IpY')

        if (ouIdx < 0 || learnersIdx < 0 || seatsIdx < 0) {
            return setPriorityOuIds([])
        }

        const byOu = new Map()
        for (const r of rows) {
            const ou = r[ouIdx]
            const learners = Number(r[learnersIdx] || 0)
            const seats = Number(r[seatsIdx] || 0)
            const agg = byOu.get(ou) ?? { learners: 0, seats: 0 }
            agg.learners += Number.isNaN(learners) ? 0 : learners
            agg.seats += Number.isNaN(seats) ? 0 : seats
            byOu.set(ou, agg)
        }

        const bad = []
        for (const [ou, { learners, seats }] of byOu.entries()) {
            if (learners > 0 && seats / learners < RATIO_THRESHOLD) {
                bad.push({ ou, ratio: seats / learners })
            }
        }

        bad.sort((a, b) => a.ratio - b.ratio)
        setPriorityOuIds(bad.slice(0, 8).map(x => x.ou))
    }, [rows, headers])

    // Batch henting av OU-data
    const OU_BATCH_QUERY = useMemo(
        () => ({
            ous: {
                resource: 'organisationUnits',
                params: ({ ids }) => ({
                    ...(ids?.length
                        ? { filter: `id:in:[${ids.join(',')}]` }
                        : {}),
                    fields: 'id,name,displayName,parent[name]',
                    paging: false,
                }),
            },
        }),
        []
    )

    const { data: ouResp } = useDataQuery(OU_BATCH_QUERY, {
        variables: { ids: priorityOuIds },
        lazy: !priorityOuIds.length,
    })

    const ouList = ouResp?.ous?.organisationUnits ?? []
    const pendingSync = 0

    return (
        <div style={{ padding: 16 }}>
            {/* Demo / eksempel-timeline – kan evt fjernes senere */}
            <InspectionTimeline schoolId={'k6MLijE92iz'} />

            <h2 style={{ marginBottom: 8 }}>Overview</h2>

            <SyncBanner />

            {/* HERO / PRIMARY CTA */}
            <section
                style={{
                    marginTop: 16,
                    padding: 16,
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc',
                    borderRadius: 12,
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: 16,
                    alignItems: 'center',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            marginBottom: 6,
                        }}
                    >
                        Welcome — key metrics and quick links to get you started.
                    </div>
                    <p style={{ margin: 0, color: '#475569' }}>
                        Go to the inspection module to browse organisation trees,
                        open your school's form, and submit data.
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap',
                    }}
                >
                    <button
                        onClick={openSchoolInspection}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid #2563eb',
                            background: '#2563eb',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                        aria-label="Open Inspector"
                    >
                        Open inspector
                    </button>

                    {lastOu && (
                        <button
                            onClick={() => openSchool(lastOu)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px dashed #e5e7eb',
                                background: '#fff',
                                cursor: 'pointer',
                            }}
                            title="Open your last visited school"
                        >
                            Resume last school
                        </button>
                    )}
                </div>
            </section>

            {/* KPI-er */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fit, minmax(220px,1fr))',
                    gap: 12,
                    marginTop: 16,
                }}
            >
                <MetricTile
                    title="Inspections this month"
                    value={loading ? '…' : String(inspectionsThisMonth)}
                />
                <MetricTile
                    title="Pending sync"
                    value={String(pendingSync)}
                />
                <MetricTile
                    title="Schools needing follow-up"
                    value={loading ? '…' : String(ouList.length)}
                />
            </section>

            {/* Prioritetsliste */}
            <section style={{ marginTop: 16 }}>
                <h3>Priority schools</h3>
                {error && (
                    <p style={{ color: 'crimson' }}>
                        Error loading analytics: {error.message}
                    </p>
                )}
                {!loading && !error && ouList.length === 0 && (
                    <p>No priority schools detected this month.</p>
                )}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit,minmax(280px,1fr))',
                        gap: 12,
                    }}
                >
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