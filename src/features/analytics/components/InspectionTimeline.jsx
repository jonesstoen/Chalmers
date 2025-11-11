import React, { useState, useMemo } from 'react'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useDataQuery } from '@dhis2/app-runtime'
import useSchoolAnalyticsWrapper from './SchoolAnalyticsView'

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

const ouQuery = {
    ou: {
        resource: 'organisationUnits',
        id: ({ id }) => id,
        params: { fields: 'displayName,name' },
    },
}

const Bool = ({ v }) => (
    <span style={{ fontWeight: 700, color: v ? '#065f46' : '#991b1b' }}>{v ? '✓' : '✗'}</span>
)

const Badge = ({ v }) => (
    <span style={styles.badge}>
        <span
            style={{
                ...styles.badgeFill,
                width: `${(Math.max(0, Math.min(5, Number(v) || 0)) / 5) * 100}%`,
            }}
        />
        <span style={styles.badgeText}>{v ?? '–'}</span>
    </span>
)



export default function InspectionTimeline({ schoolId, onSelect }) {
    // 1) Hooks først – aldri betinget
    console.log(schoolId)
    const { events, loading, error } = useSchoolAnalyticsWrapper(schoolId)

    // Stabil "variables"-ref så useDataQuery ikke retrigges unødig
    const ouVars = useMemo(() => ({ id: schoolId || '' }), [schoolId])
    const { data: ouData } = useDataQuery(ouQuery, { variables: ouVars, lazy: !schoolId })
    const schoolName = ouData?.ou?.displayName || ouData?.ou?.name || schoolId

    const [sortKey, setSortKey] = useState('eventdate')
    const [sortAsc, setSortAsc] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)

    // Sortering beregnes alltid før early returns (unngå “rendered more hooks”)
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

    // 2) Early returns etter at alle hooks er kalt
    if (!schoolId) return null
    if (loading) return <CircularLoader />
    if (error) return <NoticeBox error title="Error">{error.message}</NoticeBox>
    if (!events?.length) return <NoticeBox title="No data">No inspection events found.</NoticeBox>

    const toggleSort = (key) => {
        if (sortKey === key) setSortAsc((v) => !v)
        else {
            setSortKey(key)
            setSortAsc(true)
        }
    }

    const pick = (ev) => {
        setSelectedEvent(ev)
        onSelect?.(ev)
    }

    return (
        <div style={{ padding: '0.75rem', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 .5rem' }}>Inspection Events for {schoolName}</h3>

            <table style={styles.table}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                    {th('Date', () => toggleSort('eventdate'), sortKey === 'eventdate', sortAsc)}
                    {th('Status', () => toggleSort('eventstatus'), sortKey === 'eventstatus', sortAsc)}
                    {th('Learners', () => toggleSort(F.learners), sortKey === F.learners, sortAsc)}
                    {th('Seats', () => toggleSort(F.seats), sortKey === F.seats, sortAsc)}
                    {th('Classrooms', () => toggleSort(F.rooms), sortKey === F.rooms, sortAsc)}
                    {th('Clean rooms', () => toggleSort(F.clean), sortKey === F.clean, sortAsc)}
                    {th('Teachers', () => toggleSort(F.teachers), sortKey === F.teachers, sortAsc)}
                    <th style={styles.group}>Lab</th>
                    <th style={styles.group}>Lab cond</th>
                    <th style={styles.group}>Electricity</th>
                    <th style={styles.group}>Elec cond</th>
                    <th style={styles.group}>Handwash</th>
                    <th style={styles.group}>HW cond</th>
                    <th style={styles.group}>Library</th>
                    <th style={styles.group}>Lib cond</th>
                    <th style={styles.group}>Playground</th>
                    <th style={styles.group}>Play cond</th>
                    {th('Toilets T', () => toggleSort(F.toiletsT), sortKey === F.toiletsT, sortAsc)}
                    {th('Toilets B', () => toggleSort(F.toiletsB), sortKey === F.toiletsB, sortAsc)}
                    {th('Toilets G', () => toggleSort(F.toiletsG), sortKey === F.toiletsG, sortAsc)}
                    {th('Toilets total', () => toggleSort(F.toiletsTot), sortKey === F.toiletsTot, sortAsc)}
                </tr>
                </thead>

                <tbody>
                {sorted.map((e, i) => {
                    const isSel = selectedEvent?.psi === e.psi
                    const rowStyle = {
                        ...styles.tr,
                        background: isSel ? '#f1f5f9' : i % 2 ? '#fafafa' : '#fff',
                    }
                    return (
                        <tr key={e.psi || i} onClick={() => pick(e)} style={rowStyle}>
                            <td style={styles.td}>{new Date(e.eventdate).toLocaleDateString()}</td>
                            <td style={styles.td}>{e.eventstatus}</td>
                            <td style={styles.tdNum}>{e[F.learners] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.seats] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.rooms] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.clean] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.teachers] ?? '–'}</td>

                            <td style={styles.tdCenter}><Bool v={toBool(e[F.lab.on])} /></td>
                            <td style={styles.td}><Badge v={e[F.lab.cond]} /></td>
                            <td style={styles.tdCenter}><Bool v={toBool(e[F.elec.on])} /></td>
                            <td style={styles.td}><Badge v={e[F.elec.cond]} /></td>
                            <td style={styles.tdCenter}><Bool v={toBool(e[F.wash.on])} /></td>
                            <td style={styles.td}><Badge v={e[F.wash.cond]} /></td>
                            <td style={styles.tdCenter}><Bool v={toBool(e[F.lib.on])} /></td>
                            <td style={styles.td}><Badge v={e[F.lib.cond]} /></td>
                            <td style={styles.tdCenter}><Bool v={toBool(e[F.play.on])} /></td>
                            <td style={styles.td}><Badge v={e[F.play.cond]} /></td>

                            <td style={styles.tdNum}>{e[F.toiletsT] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.toiletsB] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.toiletsG] ?? '–'}</td>
                            <td style={styles.tdNum}>{e[F.toiletsTot] ?? '–'}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>

            {selectedEvent && (
                <div style={styles.detailBox}>
                    <h4 style={{ marginTop: 0 }}>Selected Event</h4>
                    <p><strong>ID:</strong> {selectedEvent.psi}</p>
                    <p><strong>Date:</strong> {new Date(selectedEvent.eventdate).toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedEvent.eventstatus}</p>
                </div>
            )}
        </div>
    )
}

function th(label, onClick, active, asc) {
    return (
        <th onClick={onClick} style={styles.th}>
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

const styles = {
    table: {
        borderCollapse: 'separate',
        borderSpacing: 0,
        width: '100%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        border: '1px solid #e5e7eb',
    },
    th: {
        position: 'sticky',
        top: 0,
        background: '#f1f5f9',
        borderBottom: '1px solid #e5e7eb',
        textAlign: 'left',
        padding: '6px 8px',
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        zIndex: 1,
    },
    group: {
        position: 'sticky',
        top: 0,
        background: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
        padding: '6px 8px',
        whiteSpace: 'nowrap',
        fontWeight: 600,
    },
    tr: { cursor: 'pointer' },
    td: { padding: '6px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
    tdNum: {
        padding: '6px 8px',
        borderBottom: '1px solid #f1f5f9',
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
    },
    tdCenter: { padding: '6px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' },
    badge: {
        position: 'relative',
        display: 'inline-block',
        minWidth: 42,
        height: 18,
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        background: '#f8fafc',
        overflow: 'hidden',
    },
    badgeFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: '#bfdbfe' },
    badgeText: { position: 'relative', fontSize: 12, padding: '0 6px' },
    detailBox: {
        marginTop: '1rem',
        padding: '0.75rem',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#fff',
    },
}