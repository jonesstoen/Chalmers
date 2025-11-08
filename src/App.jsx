import React, { useState } from 'react'
import { OrganisationUnitTree } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useOrgUnitTree } from './services/api/treeAPI'
import useFetchOrgUnits from './services/api/useFetchOrgUnits'
import useFetchAnalytics from './services/api/analyticsAPI'
import classes from './App.module.css'
import SchoolInspectionForm from './services/api/SchoolInspectionForm'
import PopulateDataButton from './services/api/PopulateDataButton'
import AnalyticsSection from './services/api/AnalyticsSection'
import './locales'



const App = () => {
	
    // Test: Fetch aggregated student count from all descendants of Kanfig
    // const { data: testData, loading: testLoading, error: testError } = useFetchAnalytics(
    //     'UxK2o06ScIe', // School Inspection program
    //     { stage: 'eJiBjm9Rl7E' }, // School Inspection stage
    //     [],
    //     ['RlPlK44dtoo'], // Kanfig region
    //     true // Aggregate from descendants
    // )
    
    // if (testData?.analytics) {
	// 	console.log(testData.rows)

    //     console.log('🧪 Test Analytics (DESCENDANTS mode):')
    //     console.log('  - Total rows:', testData.analytics.rows?.length || 0)
    //     console.log('  - Headers:', testData.analytics.headers)
    //     console.log('  - Sample rows:', testData.analytics.rows?.slice(0, 5))
    //     console.log('  - Full data:', testData.analytics)
    // }

    const { roots, selected, initiallyExpanded, handleChange } = useOrgUnitTree({
        rootIds: ['Bp3y61WbHwn', 'RlPlK44dtoo'],
        singleSelection: true,
    })

    const { data, loading, error, selectedId } = useFetchOrgUnits(selected)
    // Treat level < 5 as aggregate (region/cluster)
    const isAggregate = (data?.ou?.level ?? Infinity) < 5

    const [activeProgram, setActiveProgram] = useState(null)
    const [activeStage, setActiveStage] = useState(null)
    const { data: analyticsData, loading: analyticsLoading, error: analyticsError } =
        useFetchAnalytics(activeProgram, { stage: activeStage }, [], selected, isAggregate)

    return (
		
        <div className={classes.container}>
            <h2>{i18n.t('Select a school')}</h2>
            <AnalyticsSection />

            {/* Test data generator */}
            <PopulateDataButton />

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
                            <SchoolInspectionForm orgUnitId={data.ou.id} />
                        </>
                    )}

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
