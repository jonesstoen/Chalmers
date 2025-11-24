import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetchAnalytics from '../SchoolInspectionPage/history/api/analyticsAPI'
import { useCacheableQuery } from '../../shared/cache/cacheableQuery'
import { useOutboxCount } from '../../shared/cache/useOutboxCount'
import MetricTile from './MetricTile'
import SchoolSearchBar from './components/SchoolSearchBar'
import styles from './LandingPage.module.css'

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID = 'eJiBjm9Rl7E'
const ROOTS = [
    { id: 'Bp3y61WbHwn', label: 'Kanifing' },
    { id: 'RlPlK44dtoo', label: 'Banjul' },
]
const MONTHLY_INSPECTION_TARGET = 2500
const EMPTY_OU_VARIABLES = { ids: [] }

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

    const hasOuRequest = Boolean(lastOu)
    const ouVariables = useMemo(
        () => (hasOuRequest ? { ids: allOuIds } : EMPTY_OU_VARIABLES),
        [hasOuRequest, allOuIds]
    )
    const ouDataKey = useMemo(
        () =>
            hasOuRequest
                ? `query:landing:lastOu:${lastOu}`
                : 'query:landing:lastOu:none',
        [hasOuRequest, lastOu]
    )

    const { data: ouResp } = useCacheableQuery(
        'data',
        ouDataKey,
        OU_BATCH_QUERY,
        ouVariables,
        !hasOuRequest
    )

    const ouList = ouResp?.ous?.organisationUnits ?? []
    const lastOuInfo = lastOu
        ? ouList.find(ou => ou.id === lastOu) || null
        : null

    const { count: pendingSync, loading: pendingSyncLoading } = useOutboxCount()
    const isOnline =
        typeof navigator !== 'undefined' ? navigator.onLine : true

    const progressRatio =
        MONTHLY_INSPECTION_TARGET > 0
            ? Math.min(1, inspectionsThisMonth / MONTHLY_INSPECTION_TARGET)
            : 0
    const progressPct = Math.round(progressRatio * 100)

    return (
        <div className={styles.pageContainer}>
            {/* Online status at top */}
            <p className={`${styles.onlineStatus} ${!isOnline ? styles.onlineStatusOffline : ''}`}>
                {isOnline
                    ? 'Online — changes sync automatically.'
                    : 'Offline — changes will sync when you are back online.'}
            </p>

            {/* Main centered container */}
            <div className={styles.mainContainer}>
                {/* Welcome text */}
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>
                        Welcome
                    </h1>
                    <p className={styles.welcomeText}>
                        Get started by opening the inspector, resuming your last
                        school, or searching for a school.
                    </p>
                </div>

                {/* Centered buttons and search */}
                <div className={styles.actionsContainer}>
                    <button
                        onClick={openSchoolInspection}
                        className={styles.primaryButton}
                        aria-label="Open Inspector"
                    >
                        Open inspector
                    </button>

                    {lastOu && (
                        <button
                            onClick={() => openSchool(lastOu)}
                            className={styles.secondaryButton}
                            title="Open your last visited school"
                        >
                            <span>Resume last school</span>
                            {lastOuInfo && (
                                <span className={styles.secondaryButtonSubtext}>
                                    📍 Last visited:{' '}
                                    {lastOuInfo.displayName || lastOuInfo.name}
                                </span>
                            )}
                        </button>
                    )}

                    <div className={styles.searchContainer}>
                        <SchoolSearchBar
                            onSelect={school => openSchool(school.id)}
                        />
                    </div>
                </div>

                {/* Metrics at bottom */}
                <div className={styles.metricsGrid}>
                    <MetricTile
                        title="📊 Inspections this month"
                        value={loading ? '…' : String(inspectionsThisMonth)}
                        subtitle="Across Kanifing and Banjul"
                    />
                    <MetricTile
                        title="🔄 Pending sync"
                        value={pendingSyncLoading ? '…' : String(pendingSync)}
                        subtitle="Waiting to be sent when online"
                    />
                    <MetricTile
                        title="⚠️ Schools needing follow-up"
                        value={loading ? '…' : String(ouList.length)}
                        subtitle="Based on seat-to-learner ratio"
                    />
                </div>

                {/* Monthly progress */}
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressTitle}>
                            Monthly inspection progress
                        </span>
                        <span className={styles.progressStats}>
                            {inspectionsThisMonth} / {MONTHLY_INSPECTION_TARGET}{' '}
                            ({progressPct}%)
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={`${styles.progressBarFill} ${progressPct >= 100 ? styles.progressBarFillComplete : ''}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}