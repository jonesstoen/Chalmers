import React, { useState } from 'react'
import { OrganisationUnitTree } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useOrgUnitTree } from './services/api/treeAPI'
import useFetchOrgUnits from './services/api/useFetchOrgUnits'
import useFetchAnalytics from './services/api/analyticsAPI'
import { useStudentCount } from './services/api/useStudentCount'
import { useSeatToLearnerRatios } from './services/api/useSeatToLearnerRatio'
import { SCHOOL_LEVELS } from './services/api/schoolLevels' // Assuming you made this file
import classes from './App.module.css'
//import { usePostSchoolInspectionEvent } from "./services/api/usePostSchoolInspectionEvent"
import SchoolInspectionForm from './services/api/SchoolInspectionForm'
import './locales'
// schoolLevels.js (or at top of your hook file)



const App = () => {
    const { roots, selected, initiallyExpanded, handleChange } = useOrgUnitTree({
        rootIds: ['Bp3y61WbHwn', 'RlPlK44dtoo'],
        singleSelection: true,
    })

    const { data, loading, error, selectedId } = useFetchOrgUnits(selected)
    // Student count hook (only call if enrollment details stage is present)
    const orgUnitId = data?.ou?.id
    const hasEnrollmentStage = data?.ou?.programs?.some(
        (p) => p.programStages?.some((s) => s.id === 'Ni2qsy2WJn4')
    )
    const { count: studentCount, loading: studentCountLoading, error: studentCountError } =
        useStudentCount(orgUnitId && hasEnrollmentStage ? orgUnitId : null)

    const [activeProgram, setActiveProgram] = useState(null)
    const [activeStage, setActiveStage] = useState(null)
const {
    ratios,
    loading: seatLoading,
    error: seatError
} = useSeatToLearnerRatios(orgUnitId, '2024', SCHOOL_LEVELS)

    // Treat level < 5 as aggregate (region/cluster)
    const isAggregate = (data?.ou?.level ?? Infinity) < 5

    const { data: analyticsData, loading: analyticsLoading, error: analyticsError } =
        useFetchAnalytics(activeProgram, { stage: activeStage }, [], selected, isAggregate)

    return (
        <div className={classes.container}>
            <h2>{i18n.t('Select a school')}</h2>

            <OrganisationUnitTree
                roots={roots}
                selected={selected}
                initiallyExpanded={initiallyExpanded}
                onChange={handleChange}
                singleSelection
            />

            {selectedId && (
                <div style={{ marginTop: '1rem' }}>
                    <h3>{i18n.t('Selected school: {{id}}', { id: selectedId })}</h3>

                    {loading && <p>{i18n.t('Loading school data...')}</p>}
                    {error && <p>{i18n.t('Error loading data')}</p>}

                    {data?.ou && (
                        <>
                            <h4>{i18n.t('Organisation Unit Details')}</h4>
                            <div
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    padding: '1rem',
                                    background: '#fafafa',
                                    maxWidth: 700,
                                }}
                            >
                                <p><strong>Name:</strong> {data.ou.displayName || data.ou.name}</p>
                                <p><strong>ID:</strong> {data.ou.id}</p>
                                <p><strong>Parent:</strong> {data.ou.parent?.name || 'None'}</p>
                                <p><strong>Level:</strong> {data.ou.level ?? '—'}</p>

                                <p><strong>Children:</strong> {data.ou.children?.length ?? 0}</p>
                                {/* Student count if enrollment details available */}
                                {hasEnrollmentStage && (
                                    <>
                                        <p>
                                            <strong>Student count:</strong>{' '}
                                            {studentCountLoading
                                                ? 'Loading...'
                                                : studentCountError
                                                ? 'Error'
                                                : studentCount ?? '—'}
                                        </p>
                                        {/*
                                        <p>
                                            <strong>Seat to learner ratio (actual):</strong>{' '}
                                            {seatRatioLoading
                                                ? 'Loading...'
                                                : seatRatioError
                                                ? 'Error loading seat data.'
                                                : totalSeatsActual === 0
                                                ? 'No seat data available for this school.'
                                                : `${ratioActual.toFixed(2)} (seats: ${totalSeatsActual})`}
                                        </p>
                                        <p>
                                            <strong>Seat to learner ratio (good):</strong>{' '}
                                            {seatRatioLoading
                                                ? 'Loading...'
                                                : seatRatioError
                                                ? 'Error'
                                                : isFinite(ratioGood)
                                                ? ratioGood.toFixed(2)
                                                : '—'}
                                            {'  '}<span style={{ color: '#888', fontSize: '0.9em' }}>
                                                (good seats: {totalSeatsGood})
                                            </span>
                                        </p>
                                        */}
                                    </>
                                )}

                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Programs:</strong>
                                    {data.ou.programs?.length ? (
                                        <ul>
                                            {data.ou.programs.map((p) => (
                                                <li key={p.id}>
                                                    <span>{p.name}</span>
                                                    {p.programStages?.length > 0 && (
                                                        <ul style={{ marginLeft: '1rem' }}>
                                                            {p.programStages.map((s) => (
                                                                <li
                                                                    key={s.id}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color:
                                                                            activeStage === s.id && activeProgram === p.id
                                                                                ? '#0a58ca'
                                                                                : '#1976d2',
                                                                    }}
                                                                    onClick={() => {
                                                                        setActiveProgram(p.id)
                                                                        setActiveStage(s.id)
                                                                    }}
                                                                >
                                                                    • {s.displayName || s.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>None</p>
                                    )}
                                </div>
                            </div>
                            {/* School Inspection Form */}
                            <SchoolInspectionForm orgUnitId={orgUnitId} />
                        </>
                    )}
{!seatLoading && !seatError && ratios && (
    <div style={{ marginTop: '1rem' }}>
        <h4>Seat-to-Learner Ratios</h4>
        <ul>
            {Object.keys(ratios).map((level) => (
                <li key={level}>
                    <strong>{level}:</strong>{' '}
                    {ratios[level].learners === 0
                        ? 'No learner data available'
                        : `${ratios[level].actual.toFixed(2)} (actual seats: ${ratios[level].seatsActual}, learners: ${ratios[level].learners})`}
                </li>
            ))}
        </ul>
    </div>
)}

{seatLoading && <p>Loading seat data...</p>}
{seatError && <p>Error loading seat data.</p>}

                    {/* === ANALYTICS DATA SECTION === */}
                    {activeStage && (
                        <div
                            style={{
                                marginTop: '1.5rem',
                                background: '#eef6ff',
                                padding: '1rem',
                                borderRadius: 8,
                                border: '1px solid #cfe2ff',
                            }}
                        >
                            <h4>
                                {i18n.t('Analytics for stage: {{stage}} (program {{program}})', {
                                    stage: activeStage,
                                    program: activeProgram,
                                })}
                            </h4>

                            {analyticsLoading && <p>{i18n.t('Fetching analytics...')}</p>}
                            {analyticsError && <p>{i18n.t('Error fetching analytics')}</p>}

                            {analyticsData?.rows?.length > 0 ? (
                                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                                    <table
                                        style={{
                                            borderCollapse: 'collapse',
                                            width: '100%',
                                            fontSize: '0.9rem',
                                            background: '#fff',
                                            borderRadius: '8px',
                                            boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <thead style={{ background: '#e9f3ff' }}>
                                            <tr>
                                                {analyticsData.headers.map((h) => (
                                                    <th
                                                        key={h.name}
                                                        style={{
                                                            borderBottom: '2px solid #ccc',
                                                            padding: '0.5rem',
                                                            textAlign: 'left',
                                                        }}
                                                    >
                                                        {h.column || h.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analyticsData.rows.map((row, idx) => (
                                                <tr key={idx}>
                                                    {row.map((cell, i) => (
                                                        <td
                                                            key={i}
                                                            style={{
                                                                padding: '0.5rem',
                                                                borderBottom: '1px solid #eee',
                                                            }}
                                                        >
                                                            {cell || '—'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                !analyticsLoading &&
                                !analyticsError && (
                                    <p style={{ marginTop: '1rem' }}>
                                        {i18n.t('No analytics data available for this stage.')}
                                    </p>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default App
