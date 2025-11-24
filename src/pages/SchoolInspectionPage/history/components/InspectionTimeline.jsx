import React, { useState, useMemo, useCallback } from 'react'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import useSchoolAnalyticsWrapper from '../hooks/useSchoolEvents'
import classes from './InspectionTimeline.module.css'
import { useCacheableQuery } from '../../../../shared/cache/cacheableQuery'

// ----------------------------
// STATIC OU QUERY
// ----------------------------
function buildOuParams() {
    return {
        fields: 'displayName,name',
    }
}

const OU_QUERY = {
    ou: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: buildOuParams,   // stable function
    },
}

// ----------------------------
// FIELD IDS (STATIC)
// ----------------------------
const F = {
    lab: { on: 'Nvp4hIbXrzF', cond: 'gzhjCMe7OyS' },
    elec: { on: 'IKiSAA19Xvl', cond: 'MH2eDd7qWxR' },
    wash: { on: 'n9KwS4rY2HC', cond: 'ie3bFiVatHT' },
    lib: { on: 'Y6DQqwTdhiZ', cond: 'IAomDvMcUDr' },
    play: { on: 'XThfmg6f2oC', cond: 'JzZfwXtdL6G' },
    rooms: 'ya5SyA5hej4',
    clean: 'XIgpDhDC4Ol',
    teachers: 'LME331J5aev',
    toiletsT: 'I13NTyLrHBm',
    toiletsB: 'QXcKg7GSr4e',
    toiletsG: 'OGmIo4kFUYr',
    toiletsTot: 'iytoDmoTUWY',
    learners: 'DO0LBJfXY00',
    seats: 'jcC1uz56IpY',
}

// ----------------------------
// SMALL PRESENTATION COMPONENTS
// ----------------------------
const Bool = ({ v }) => (
    <span
        className={v ? classes.boolOk : classes.boolBad}
        title={v ? 'Available' : 'Not available'}
    >
        {v ? '✓' : '✗'}
    </span>
)

const Badge = ({ v }) => (
    <span className={classes.badge}>
        <span
            className={classes.badgeFill}
            style={{
                width: `${(Math.max(0, Math.min(5, Number(v) || 0)) / 5) * 100}%`,
            }}
        />
        <span className={classes.badgeText}>{v ?? '–'}</span>
    </span>
)

const StatusChip = ({ status }) => {
    if (!status) return null
    const key = status.toLowerCase()
    const extra = classes['statusChip_' + key] || ''
    return <span className={`${classes.statusChip} ${extra}`}>{status}</span>
}

function Th({ label, active, asc, onClick, first }) {
    const base = `${classes.th} ${first ? classes.firstColTh : ''}`
    return (
        <th className={base} onClick={onClick} title="Click to sort">
            <span className={classes.thLabel}>{label}</span>
            {active ? (
                <span className={classes.sortIcon}>{asc ? '▲' : '▼'}</span>
            ) : (
                <span className={classes.sortIconInactive}>⬍</span>
            )}
        </th>
    )
}

// ----------------------------
// HELPERS
// ----------------------------
function toBool(v) {
    if (v === true || v === 'true') return true
    const n = Number(v)
    return !Number.isNaN(n) && n > 0
}

// ----------------------------
// MAIN COMPONENT
// ----------------------------
export default function InspectionTimeline({ schoolId, onSelect }) {
    // ----------------------------
    // 1. FETCH EVENTS (primary data)
    // ----------------------------
    const { events, loading, error } = useSchoolAnalyticsWrapper(schoolId)

    // ----------------------------
    // 2. Fetch OU name (cached)
    // ----------------------------
    const ouVariables = useMemo(
        () => ({ id: schoolId || '__none__' }),
        [schoolId]
    )

    const ouDataKey = useMemo(
        () =>
            JSON.stringify({
                type: 'orgUnitBasic',
                id: schoolId || '__none__',
            }),
        [schoolId]
    )

    const { data: ouData } = useCacheableQuery(
        'data',
        ouDataKey,
        OU_QUERY,
        ouVariables,
        !schoolId               // lazy if no id
    )

    const schoolName =
        ouData?.ou?.displayName || ouData?.ou?.name || schoolId

    // ----------------------------
    // 3. Sorting state
    // ----------------------------
    const [sortKey, setSortKey] = useState('eventdate')
    const [sortAsc, setSortAsc] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)

    const numericKeys = useMemo(
        () =>
            new Set([
                F.learners,
                F.seats,
                F.rooms,
                F.clean,
                F.teachers,
                F.toiletsT,
                F.toiletsB,
                F.toiletsG,
                F.toiletsTot,
            ]),
        []
    )

    // ----------------------------
    // 4. Sorting computation
    // ----------------------------
    const sorted = useMemo(() => {
        if (!Array.isArray(events)) return []

        const list = [...events]

        list.sort((a, b) => {
            const A = a?.[sortKey]
            const B = b?.[sortKey]

            // Date sorting
            if (sortKey === 'eventdate') {
                const diff =
                    new Date(A).getTime() - new Date(B).getTime()
                return sortAsc ? diff : -diff
            }

            // Numerics
            if (numericKeys.has(sortKey)) {
                const nA = Number(A)
                const nB = Number(B)
                if (Number.isNaN(nA) && Number.isNaN(nB)) return 0
                if (Number.isNaN(nA)) return sortAsc ? 1 : -1
                if (Number.isNaN(nB)) return sortAsc ? -1 : 1
                const diff = nA - nB
                return sortAsc ? diff : -diff
            }

            // Text
            const c = (A ?? '').toString().localeCompare((B ?? '').toString())
            return sortAsc ? c : -c
        })

        return list
    }, [events, sortKey, sortAsc, numericKeys])

    // ----------------------------
    // 5. Sorting toggler
    // ----------------------------
    const toggleSort = useCallback(
        key => {
            if (sortKey === key) setSortAsc(v => !v)
            else {
                setSortKey(key)
                setSortAsc(true)
            }
        },
        [sortKey]
    )

    // ----------------------------
    // 6. Event selection
    // ----------------------------
    const pick = useCallback(
        ev => {
            setSelectedEvent(ev)
            onSelect?.(ev)
        },
        [onSelect]
    )

    const isSortedCol = useCallback(
        key => sortKey === key,
        [sortKey]
    )

    // ----------------------------
    // 7. Conditions
    // ----------------------------
    if (!schoolId) return null
    if (loading) return <CircularLoader />
    if (error)
        return (
            <NoticeBox error title="Error">
                {error.message}
            </NoticeBox>
        )
    if (!events?.length)
        return (
            <NoticeBox title="No data">
                No inspection events found.
            </NoticeBox>
        )

    // ----------------------------
    // 8. Summary
    // ----------------------------
    const numEvents = events.length
    const latestByDate = [...events].sort(
        (a, b) => new Date(b.eventdate) - new Date(a.eventdate)
    )[0]

    const latestDateLabel = latestByDate
        ? new Date(latestByDate.eventdate).toLocaleDateString()
        : '–'
    return (
        <div style={{ padding: '0.75rem', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 .25rem' }}>
                Inspection Events for {schoolName}
            </h3>

            <div className={classes.summaryRow}>
                <span>
                    Events: <strong>{numEvents}</strong>
                </span>
                <span>
                    Last inspection: <strong>{latestDateLabel}</strong>
                </span>
                <span className={classes.sortHint}>Tip: Click column headers to sort</span>
            </div>

            <table className={classes.table}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                    <Th
                        label="Date"
                        first
                        onClick={() => toggleSort('eventdate')}
                        active={sortKey === 'eventdate'}
                        asc={sortAsc}
                    />
                    <Th
                        label="Status"
                        onClick={() => toggleSort('eventstatus')}
                        active={sortKey === 'eventstatus'}
                        asc={sortAsc}
                    />
                    <Th
                        label="Learners"
                        onClick={() => toggleSort(F.learners)}
                        active={sortKey === F.learners}
                        asc={sortAsc}
                    />
                    <Th
                        label="Seats"
                        onClick={() => toggleSort(F.seats)}
                        active={sortKey === F.seats}
                        asc={sortAsc}
                    />
                    <Th
                        label="Classrooms"
                        onClick={() => toggleSort(F.rooms)}
                        active={sortKey === F.rooms}
                        asc={sortAsc}
                    />
                    <Th
                        label="Clean rooms"
                        onClick={() => toggleSort(F.clean)}
                        active={sortKey === F.clean}
                        asc={sortAsc}
                    />
                    <Th
                        label="Teachers"
                        onClick={() => toggleSort(F.teachers)}
                        active={sortKey === F.teachers}
                        asc={sortAsc}
                    />
                    <th className={classes.group}>Lab</th>
                    <th className={classes.group}>Lab cond</th>
                    <th className={classes.group}>Electricity</th>
                    <th className={classes.group}>Elec cond</th>
                    <th className={classes.group}>Handwash</th>
                    <th className={classes.group}>HW cond</th>
                    <th className={classes.group}>Library</th>
                    <th className={classes.group}>Lib cond</th>
                    <th className={classes.group}>Playground</th>
                    <th className={classes.group}>Play cond</th>
                    <Th
                        label="Toilets T"
                        onClick={() => toggleSort(F.toiletsT)}
                        active={sortKey === F.toiletsT}
                        asc={sortAsc}
                    />
                    <Th
                        label="Toilets B"
                        onClick={() => toggleSort(F.toiletsB)}
                        active={sortKey === F.toiletsB}
                        asc={sortAsc}
                    />
                    <Th
                        label="Toilets G"
                        onClick={() => toggleSort(F.toiletsG)}
                        active={sortKey === F.toiletsG}
                        asc={sortAsc}
                    />
                    <Th
                        label="Toilets total"
                        onClick={() => toggleSort(F.toiletsTot)}
                        active={sortKey === F.toiletsTot}
                        asc={sortAsc}
                    />
                </tr>
                </thead>

                <tbody>
                {sorted.map((e, i) => {
                    const isSel = selectedEvent?.psi === e.psi
                    const rowClass = `${classes.tr} ${
                        isSel
                            ? classes.rowSelected
                            : i % 2
                                ? classes.rowAlt
                                : classes.row
                    }`
                    return (
                        <tr
                            key={e.psi || i}
                            onClick={() => pick(e)}
                            className={rowClass}
                        >
                            <td
                                className={`${classes.td} ${classes.firstCol} ${
                                    isSortedCol('eventdate')
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {new Date(
                                    e.eventdate
                                ).toLocaleDateString()}
                            </td>

                            <td
                                className={`${classes.td} ${
                                    isSortedCol('eventstatus')
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                <StatusChip status={e.eventstatus} />
                            </td>

                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.learners)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.learners] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.seats)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.seats] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.rooms)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.rooms] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.clean)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.clean] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.teachers)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.teachers] ?? '–'}
                            </td>

                            <td className={classes.tdCenter}>
                                <Bool v={toBool(e[F.lab.on])} />
                            </td>
                            <td className={classes.td}>
                                <Badge v={e[F.lab.cond]} />
                            </td>
                            <td className={classes.tdCenter}>
                                <Bool v={toBool(e[F.elec.on])} />
                            </td>
                            <td className={classes.td}>
                                <Badge v={e[F.elec.cond]} />
                            </td>
                            <td className={classes.tdCenter}>
                                <Bool v={toBool(e[F.wash.on])} />
                            </td>
                            <td className={classes.td}>
                                <Badge v={e[F.wash.cond]} />
                            </td>
                            <td className={classes.tdCenter}>
                                <Bool v={toBool(e[F.lib.on])} />
                            </td>
                            <td className={classes.td}>
                                <Badge v={e[F.lib.cond]} />
                            </td>
                            <td className={classes.tdCenter}>
                                <Bool v={toBool(e[F.play.on])} />
                            </td>
                            <td className={classes.td}>
                                <Badge v={e[F.play.cond]} />
                            </td>

                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.toiletsT)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.toiletsT] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.toiletsB)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.toiletsB] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.toiletsG)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.toiletsG] ?? '–'}
                            </td>
                            <td
                                className={`${classes.tdNum} ${
                                    isSortedCol(F.toiletsTot)
                                        ? classes.sortedCol
                                        : ''
                                }`}
                            >
                                {e[F.toiletsTot] ?? '–'}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}