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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}
        >
            {/* Online status at top */}
            <p
                style={{
                    position: 'absolute',
                    top: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    margin: 0,
                    fontSize: 12,
                    color: isOnline ? '#16a34a' : '#b45309',
                }}
            >
                {isOnline
                    ? 'Online — changes sync automatically.'
                    : 'Offline — changes will sync when you are back online.'}
            </p>

            {/* Main centered container */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 800,
                    padding: '48px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    borderRadius: 16,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 32,
                }}
            >
                {/* Welcome text */}
                <div style={{ textAlign: 'center' }}>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            marginBottom: 12,
                            color: '#0f172a',
                        }}
                    >
                        Welcome
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            color: '#475569',
                            fontSize: 16,
                            lineHeight: 1.6,
                        }}
                    >
                        Get started by opening the inspector, resuming your last
                        school, or searching for a school.
                    </p>
                </div>

                {/* Centered buttons and search */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        width: '100%',
                        maxWidth: 400,
                        margin: '0 auto',
                    }}
                >
                    <button
                        onClick={openSchoolInspection}
                        style={{
                            padding: '16px 24px',
                            borderRadius: 12,
                            border: 'none',
                            background: '#2563eb',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            width: '100%',
                            minHeight: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#1d4ed8'
                            e.currentTarget.style.boxShadow =
                                '0 4px 6px rgba(37, 99, 235, 0.3)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#2563eb'
                            e.currentTarget.style.boxShadow =
                                '0 2px 4px rgba(37, 99, 235, 0.2)'
                        }}
                        aria-label="Open Inspector"
                    >
                        Open inspector
                    </button>

                    {lastOu && (
                        <button
                            onClick={() => openSchool(lastOu)}
                            style={{
                                padding: '16px 24px',
                                borderRadius: 12,
                                border: '1px solid #e5e7eb',
                                background: '#fff',
                                color: '#0f172a',
                                fontWeight: 500,
                                fontSize: 16,
                                cursor: 'pointer',
                                width: '100%',
                                minHeight: 56,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#f8fafc'
                                e.currentTarget.style.borderColor = '#cbd5e1'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#fff'
                                e.currentTarget.style.borderColor = '#e5e7eb'
                            }}
                            title="Open your last visited school"
                        >
                            <span>Resume last school</span>
                            {lastOuInfo && (
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: '#64748b',
                                        fontWeight: 400,
                                    }}
                                >
                                    📍 Last visited:{' '}
                                    {lastOuInfo.displayName || lastOuInfo.name}
                                </span>
                            )}
                        </button>
                    )}

                    <div style={{ width: '100%', marginTop: -4 }}>
                        <SchoolSearchBar
                            onSelect={school => openSchool(school.id)}
                        />
                    </div>
                </div>

                {/* Metrics at bottom */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 16,
                        marginTop: 8,
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
                </div>

                {/* Monthly progress */}
                <div style={{ marginTop: 8 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: 8,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0f172a',
                            }}
                        >
                            Monthly inspection progress
                        </span>
                        <span
                            style={{
                                fontSize: 13,
                                color: '#64748b',
                            }}
                        >
                            {inspectionsThisMonth} / {MONTHLY_INSPECTION_TARGET}{' '}
                            ({progressPct}%)
                        </span>
                    </div>
                    <div
                        style={{
                            height: 10,
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
                </div>
            </div>
        </div>
    )
}