// features/home/LandingPage.jsx
import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataQuery } from '@dhis2/app-runtime'
import useFetchAnalytics from '../analytics/api/analyticsAPI'
import MetricTile from './MetricTile'
import SchoolSearchBar from '../inspections/components/SchoolSearchBar'

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID = 'eJiBjm9Rl7E'
const ROOTS = [
    { id: 'Bp3y61WbHwn', label: 'Kanifing' },
    { id: 'RlPlK44dtoo', label: 'Banjul' },
]
const MONTHLY_INSPECTION_TARGET = 2500

function monthRangeISO(d = new Date()) {
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const iso = x => x.toISOString().slice(0, 10)
    return { startDate: iso(start), endDate: iso(end) }
}

export default function LandingPage() {
    const navigate = useNavigate()

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

    // OU-info for lastOu
    const allOuIds = useMemo(() => {
        return lastOu ? [lastOu] : []
    }, [lastOu])

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
        variables: { ids: allOuIds },
        lazy: !allOuIds.length,
    })

    const ouList = ouResp?.ous?.organisationUnits ?? []
    const lastOuInfo = lastOu
        ? ouList.find(ou => ou.id === lastOu) || null
        : null

    const pendingSync = 0
    const isOnline =
        typeof navigator !== 'undefined' ? navigator.onLine : true

    const progressRatio =
        MONTHLY_INSPECTION_TARGET > 0
            ? Math.min(1, inspectionsThisMonth / MONTHLY_INSPECTION_TARGET)
            : 0
    const progressPct = Math.round(progressRatio * 100)

    return (
        <div
            style={{
                background: '#f1f5f9',
                minHeight: '100vh',
            }}
        >
            <div
                style={{
                    maxWidth: 1180,
                    margin: '0 auto',
                    padding: '16px 24px 32px',
                }}
            >
                <p
                    style={{
                        marginTop: 0,
                        marginBottom: 12,
                        fontSize: 12,
                        color: isOnline ? '#16a34a' : '#b45309',
                    }}
                >
                    {isOnline
                        ? 'Online — changes sync automatically.'
                        : 'Offline — changes will sync when you are back online.'}
                </p>

                {/* HERO + SEARCH I SAMME KORT */}
                <section style={{ marginTop: 8 }}>
                    <div
                        style={{
                            padding: 16,
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'minmax(0,1fr) minmax(0,1.4fr)',
                                gap: 16,
                                alignItems: 'start',
                            }}
                        >
                            {/* LEFT SIDE: Stacked buttons and search */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
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
                                        width: '100%',
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
                                            fontWeight: 500,
                                            width: '100%',
                                        }}
                                        title="Open your last visited school"
                                    >
                                        Resume last school
                                    </button>
                                )}

                                <div style={{ width: '100%', marginTop: -16 }}>
                                    <SchoolSearchBar
                                        onSelect={school => openSchool(school.id)}
                                    />
                                </div>
                            </div>

                            {/* RIGHT SIDE: Welcome text and info */}
                            <div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        marginBottom: 6,
                                    }}
                                >
                                    Welcome — key metrics and quick links to get
                                    you started.
                                </div>
                                <p
                                    style={{
                                        margin: 0,
                                        color: '#475569',
                                        fontSize: 14,
                                    }}
                                >
                                    Go to the inspection module to browse
                                    organisation trees, open your school&apos;s
                                    form, and submit data.
                                </p>

                                {lastOuInfo && (
                                    <p
                                        style={{
                                            marginTop: 10,
                                            marginBottom: 0,
                                            fontSize: 13,
                                            color: '#64748b',
                                        }}
                                    >
                                        📍 Last visited:{' '}
                                        <strong>
                                            {lastOuInfo.displayName ||
                                                lastOuInfo.name}
                                        </strong>
                                        {lastOuInfo.parent?.name
                                            ? ` (${lastOuInfo.parent.name})`
                                            : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* MONTHLY PROGRESS */}
                <section style={{ marginTop: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: 6,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#0f172a',
                            }}
                        >
                            Monthly inspection progress
                        </span>
                        <span
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            {inspectionsThisMonth} / {MONTHLY_INSPECTION_TARGET}{' '}
                            inspections ({progressPct}%)
                        </span>
                    </div>
                    <div
                        style={{
                            height: 8,
                            background: '#e5e7eb',
                            borderRadius: 999,
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                background:
                                    progressPct >= 100 ? '#16a34a' : '#2563eb',
                                transition: 'width .25s ease-out',
                            }}
                        />
                    </div>
                </section>

                {/* KPI-KORT */}
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
                        title="📊 Inspections this month"
                        value={loading ? '…' : String(inspectionsThisMonth)}
                        subtitle="Across Kanifing and Banjul"
                    />
                    <MetricTile
                        title="🔄 Pending sync"
                        value={String(pendingSync)}
                        subtitle="Waiting to be sent when online"
                    />
                    <MetricTile
                        title="⚠️ Schools needing follow-up"
                        value={loading ? '…' : String(ouList.length)}
                        subtitle="Based on seat-to-learner ratio"
                    />
                </section>
            </div>
        </div>
    )
}