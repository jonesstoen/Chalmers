import React, { useState, useMemo } from 'react'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useDataQuery } from '@dhis2/app-runtime'
import useSchoolAnalyticsWrapper from '../hooks/useSchoolEvents'
import classes from './InspectionTimeline.module.css'

const F = {
    lab: { on: 'Nvp4hIbXrzF', cond: 'gzhjCMe7OyS' },
    elec: { on: 'IKiSAA19Xvl', cond: 'MH2eDd7qWxR' },
    wash: { on: 'n9KwS4rY2HC', cond: 'ie3bFiVatHT' },
    lib:  { on: 'Y6DQqwTdhiZ', cond: 'IAomDvMcUDr' },
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

// Query to fetch organisation unit details
const ouQuery = {
    ou: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: { fields: 'displayName,name' },
    },
}

const Bool = ({ v }) => (
    <span className={v ? classes.boolOk : classes.boolBad}>{v ? '✓' : '✗'}</span>
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

function Th({ label, active, asc, onClick, first }) {
    return (
        <th
            onClick={onClick}
            className={`${classes.th} ${first ? classes.firstColTh : ''}`}
        >
            {label}
            {active ? (asc ? ' ▲' : ' ▼') : ''}
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

    const ouVars = useMemo(
        () => ({ id: schoolId || '' }),
        [schoolId]
    )
    const { data: ouData } = useDataQuery(ouQuery, {
        variables: ouVars,
        lazy: !schoolId,
    })
    const schoolName = ouData?.ou?.displayName || ouData?.ou?.name || schoolId

    const [sortKey, setSortKey] = useState('eventdate')
    const [sortAsc, setSortAsc] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)

    const sorted = useMemo(() => {
        const list = Array.isArray(events) ? [...events] : []
        list.sort((a, b) => {
            const A = a?.[sortKey] ?? ''
            const B = b?.[sortKey] ?? ''
            const c = A > B ? 1 : A < B ? -1 : 0
            return sortAsc ? c : -c
        })
        return list
    }, [events, sortKey, sortAsc])

    // early returns
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

    // små aggregater til “summary” over tabellen
    const numEvents = events.length

    const latestByDate = [...events].sort(
        (a, b) => new Date(b.eventdate) - new Date(a.eventdate)
    )[0]

    const latestDateLabel = latestByDate
        ? new Date(latestByDate.eventdate).toLocaleDateString()
        : '–'

    const toggleSort = key => {
        if (sortKey === key) setSortAsc(v => !v)
        else {
            setSortKey(key)
            setSortAsc(true)
        }
    }

    const pick = ev => {
        setSelectedEvent(ev)
        onSelect?.(ev)
    }

    return (
        <div style={{ padding: '0.75rem', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 .25rem' }}>
                Inspection Events for {schoolName}
            </h3>

            {/* liten info-rad over tabellen */}
            <div className={classes.summaryRow}>
                <span>
                    Events: <strong>{numEvents}</strong>
                </span>
                <span>
                    Last inspection:{' '}
                    <strong>{latestDateLabel}</strong>
                </span>
            </div>

            <table className={classes.table}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                    <Th label="Date"     first onClick={() => toggleSort('eventdate')}   active={sortKey==='eventdate'}   asc={sortAsc}/>
                    <Th label="Status"        onClick={() => toggleSort('eventstatus')} active={sortKey==='eventstatus'} asc={sortAsc}/>
                    <Th label="Learners"      onClick={() => toggleSort(F.learners)}    active={sortKey===F.learners}    asc={sortAsc}/>
                    <Th label="Seats"         onClick={() => toggleSort(F.seats)}       active={sortKey===F.seats}       asc={sortAsc}/>
                    <Th label="Classrooms"    onClick={() => toggleSort(F.rooms)}       active={sortKey===F.rooms}       asc={sortAsc}/>
                    <Th label="Clean rooms"   onClick={() => toggleSort(F.clean)}       active={sortKey===F.clean}       asc={sortAsc}/>
                    <Th label="Teachers"      onClick={() => toggleSort(F.teachers)}    active={sortKey===F.teachers}    asc={sortAsc}/>
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
                    <Th label="Toilets T"     onClick={() => toggleSort(F.toiletsT)}    active={sortKey===F.toiletsT}    asc={sortAsc}/>
                    <Th label="Toilets B"     onClick={() => toggleSort(F.toiletsB)}    active={sortKey===F.toiletsB}    asc={sortAsc}/>
                    <Th label="Toilets G"     onClick={() => toggleSort(F.toiletsG)}    active={sortKey===F.toiletsG}    asc={sortAsc}/>
                    <Th label="Toilets total" onClick={() => toggleSort(F.toiletsTot)}  active={sortKey===F.toiletsTot}  asc={sortAsc}/>
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
                        <tr key={e.psi || i} onClick={() => pick(e)} className={rowClass}>
                            <td className={`${classes.td} ${classes.firstCol}`}>{new Date(e.eventdate).toLocaleDateString()}</td>
                            <td className={classes.td}>{e.eventstatus}</td>
                            <td className={classes.tdNum}>{e[F.learners] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.seats] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.rooms] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.clean] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.teachers] ?? '–'}</td>

                            <td className={classes.tdCenter}><Bool v={toBool(e[F.lab.on])} /></td>
                            <td className={classes.td}><Badge v={e[F.lab.cond]} /></td>
                            <td className={classes.tdCenter}><Bool v={toBool(e[F.elec.on])} /></td>
                            <td className={classes.td}><Badge v={e[F.elec.cond]} /></td>
                            <td className={classes.tdCenter}><Bool v={toBool(e[F.wash.on])} /></td>
                            <td className={classes.td}><Badge v={e[F.wash.cond]} /></td>
                            <td className={classes.tdCenter}><Bool v={toBool(e[F.lib.on])} /></td>
                            <td className={classes.td}><Badge v={e[F.lib.cond]} /></td>
                            <td className={classes.tdCenter}><Bool v={toBool(e[F.play.on])} /></td>
                            <td className={classes.td}><Badge v={e[F.play.cond]} /></td>

                            <td className={classes.tdNum}>{e[F.toiletsT] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.toiletsB] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.toiletsG] ?? '–'}</td>
                            <td className={classes.tdNum}>{e[F.toiletsTot] ?? '–'}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>


        </div>
    )
}