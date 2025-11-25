import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetchAnalytics from '../SchoolInspectionPage/history/api/analyticsAPI'
import { useCacheableQuery } from '../../shared/cache/cacheableQuery'
import { useOutboxCount } from '../../shared/cache/useOutboxCount'
import MetricTile from './MetricTile'
import styles from './LandingPage.module.css'
import { useSchoolsByRegions } from '../../shared/api/useSchoolsAPI'

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID = 'eJiBjm9Rl7E'
const ROOTS = [
    { id: 'Bp3y61WbHwn', label: 'Kanifing' },
    { id: 'RlPlK44dtoo', label: 'Banjul' },
]
const EMPTY_OU_VARIABLES = { ids: [] }

function monthRangeISO(d = new Date()) {
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const iso = x => x.toISOString().slice(0, 10)
    return { startDate: iso(start), endDate: iso(end) }
}

export default function LandingPage() {
    const navigate = useNavigate()

    //  Schools by regions (for total school count)
    const regionIds = useMemo(
        () => ['RlPlK44dtoo', 'Bp3y61WbHwn'],
        []
    )

    const {
        schools = [],
        loading: schoolsLoading,
        error: schoolsError,
    } = useSchoolsByRegions(regionIds)

    const schoolMeta = useMemo(() => {
        if (!schools || schools.length === 0) {
            return { total: 0, idsSet: new Set() }
        }

        // we filter on schools
        const onlySchools = schools.filter(
            s => !s.type || s.type === 'school'
        )

        return {
            total: onlySchools.length,
            idsSet: new Set(onlySchools.map(s => s.id)),
        }
    }, [schools])

    const totalSchools = schoolMeta.total
    const schoolIdsSet = schoolMeta.idsSet

    //  Navigation helpers
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

    //  Analytics for coverage
    const { startDate, endDate } = useMemo(() => monthRangeISO(), [])

    const {
        data,
        loading: analyticsLoading,
    } = useFetchAnalytics(
        PROGRAM_ID,
        { startDate, endDate, stage: STAGE_ID },
        [],
        ROOTS.map(r => r.id),
        { descendants: true, paging: false }
    )

    const headers = data?.analytics?.headers ?? []
    const rows = data?.analytics?.rows ?? []

    const ouIndex = useMemo(
        () => headers.findIndex(h => h.name === 'ou'),
        [headers]
    )

    const schoolsWithInspectionCount = useMemo(() => {
        if (
            ouIndex === -1 ||
            !rows.length ||
            !totalSchools ||
            !schoolIdsSet.size
        ) {
            return 0
        }

        const inspectedIds = new Set(
            rows
                .map(r => r[ouIndex])
                .filter(ouId => schoolIdsSet.has(ouId))
        )

        return inspectedIds.size
    }, [ouIndex, rows, totalSchools, schoolIdsSet])

    const coveragePct =
        totalSchools > 0
            ? Math.round(
                (schoolsWithInspectionCount / totalSchools) * 100
            )
            : 0

    // OU-info for lastOu
    const allOuIds = useMemo(
        () => (lastOu ? [lastOu] : []),
        [lastOu]
    )

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

    // Pending sync
    const {
        count: pendingSync,
        loading: pendingSyncLoading,
    } = useOutboxCount()

    const isLoadingCoverage =
        analyticsLoading || schoolsLoading || schoolsError

    return (
        <div className={styles.pageContainer}>
            {/* Main centered container */}
            <div className={styles.mainContainer}>
                {/* Welcome text */}
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>Welcome</h1>
                    <p className={styles.welcomeText}>
                        Get started by opening the inspector, resuming your last
                        school, or searching for a school.
                    </p>
                </div>

                {/* Centered buttons */}
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
                </div>

                {/* Metrics at bottom */}
                <div className={styles.metricsGrid}>
                    <MetricTile
                        title="✅ School coverage this month"
                        value={
                            isLoadingCoverage
                                ? '…'
                                : `${coveragePct}%`
                        }
                        subtitle={
                            isLoadingCoverage
                                ? 'Based on schools with at least one inspection'
                                : `${schoolsWithInspectionCount} of ${totalSchools} schools inspected at least once`
                        }
                    />


                    <MetricTile
                        title="🔄 Pending sync"
                        value={
                            pendingSyncLoading
                                ? '…'
                                : String(pendingSync)
                        }
                        subtitle="Waiting to be sent when online"
                    />
                </div>
            </div>
        </div>
    )
}