import React, { useState, useMemo, useCallback } from 'react'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import useSchoolAnalyticsWrapper from '../hooks/useSchoolEvents'
import classes from './InspectionTimeline.module.css'
import { useCacheableQuery } from '../../../../shared/cache/cacheableQuery'


function buildOuParams() {
    return {
        fields: 'displayName,name',
    }
}

const OU_QUERY = {
    ou: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: buildOuParams, // stable function
    },
}

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

const Bool = ({ v }) => (
    <span
        className={v ? classes.boolOk : classes.boolBad}
        title={v ? 'Available' : 'Not available'}
    >
        {v ? '✓' : '✗'}
    </span>
)

const ConditionBadge = ({ v }) => {
    if (v == null || v === '') {
        return <span className={classes.condBadgeEmpty}>–</span>
    }

    const n = Number(v)
    let levelClass = classes.condBadgeMedium

    if (!Number.isNaN(n)) {
        if (n <= 2) levelClass = classes.condBadgeBad
        else if (n >= 4) levelClass = classes.condBadgeGood
    }

    return (
        <span className={`${classes.condBadge} ${levelClass}`}>
            {v}
        </span>
    )
}

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

function toBool(v) {
    if (v === true || v === 'true') return true
    const n = Number(v)
    return !Number.isNaN(n) && n > 0
}

export default function InspectionTimeline({ schoolId, onSelect }) {
    const { events, loading, error } = useSchoolAnalyticsWrapper(schoolId)

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
        !schoolId // lazy if no id
    )

    const schoolName =
        ouData?.ou?.displayName || ouData?.ou?.name || schoolId

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
                <span className={classes.sortHint}>
                    Tip: Click column headers to sort
                </span>
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
                    <th className={classes.group}>Lab (1-5) </th>
                    <th className={classes.group}>Electricity (1-5)</th>
                    <th className={classes.group}>Handwash (1-5)</th>
                    <th className={classes.group}>Library (1-5)</th>
                    <th className={classes.group}>Playground (1-5)</th>
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

                            {/* Lab */}
                            <td className={classes.tdCenter}>
                                {(() => {
                                    const hasLab = toBool(e[F.lab.on])
                                    return (
                                        <div className={classes.facilityCell}>
                                            <Bool v={hasLab} />
                                            {hasLab && <ConditionBadge v={e[F.lab.cond]} />}
                                        </div>
                                    )
                                })()}
                            </td>

                            {/* Electricity */}
                            <td className={classes.tdCenter}>
                                {(() => {
                                    const hasElec = toBool(e[F.elec.on])
                                    return (
                                        <div className={classes.facilityCell}>
                                            <Bool v={hasElec} />
                                            {hasElec && <ConditionBadge v={e[F.elec.cond]} />}
                                        </div>
                                    )
                                })()}
                            </td>

                            {/* Handwash */}
                            <td className={classes.tdCenter}>
                                {(() => {
                                    const hasWash = toBool(e[F.wash.on])
                                    return (
                                        <div className={classes.facilityCell}>
                                            <Bool v={hasWash} />
                                            {hasWash && <ConditionBadge v={e[F.wash.cond]} />}
                                        </div>
                                    )
                                })()}
                            </td>

                            {/* Library */}
                            <td className={classes.tdCenter}>
                                {(() => {
                                    const hasLib = toBool(e[F.lib.on])
                                    return (
                                        <div className={classes.facilityCell}>
                                            <Bool v={hasLib} />
                                            {hasLib && <ConditionBadge v={e[F.lib.cond]} />}
                                        </div>
                                    )
                                })()}
                            </td>

                            {/* Playground */}
                            <td className={classes.tdCenter}>
                                {(() => {
                                    const hasPlay = toBool(e[F.play.on])
                                    return (
                                        <div className={classes.facilityCell}>
                                            <Bool v={hasPlay} />
                                            {hasPlay && <ConditionBadge v={e[F.play.cond]} />}
                                        </div>
                                    )
                                })()}
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