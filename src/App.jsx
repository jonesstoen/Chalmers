import React from 'react'
import { OrganisationUnitTree } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { useOrgUnitTree } from './services/api/treeAPI'
import useFetchOrgUnits from './services/api/useFetchOrgUnits'
import { useStageEvents } from './services/api/useStageEvents'
import classes from './App.module.css'
import './locales'

const App = () => {
    const { roots, selected, initiallyExpanded, handleChange } = useOrgUnitTree({
        rootIds: ['Bp3y61WbHwn', 'RlPlK44dtoo'],
        singleSelection: true,
    })

    const { data, loading, error, selectedId } = useFetchOrgUnits(selected)
    const {
        data: eventData,
        loading: eventLoading,
        error: eventError,
        fetchStageData,
    } = useStageEvents()

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

                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Programs:</strong>
                                    {data.ou.programs?.length ? (
                                        <ul>
                                            {data.ou.programs.map((p) => (
                                                <li key={p.id}>
                                                    {p.name}
                                                    {p.programStages?.length > 0 && (
                                                        <ul style={{ marginLeft: '1rem' }}>
                                                            {p.programStages.map((s) => (
                                                                <li
                                                                    key={s.id}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: '#1976d2',
                                                                    }}
                                                                    onClick={() =>
                                                                        fetchStageData(
                                                                            p.id,
                                                                            s.id,
                                                                            selectedId
                                                                        )
                                                                    }
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
                        </>
                    )}

                    {/* === EVENT DATA SECTION === */}
                    {eventLoading && <p>Fetching stage data...</p>}
                    {eventError && <p>Error fetching stage data</p>}
                    {eventData?.events && (
                        <div
                            style={{
                                marginTop: '1.5rem',
                                background: '#f0f6ff',
                                padding: '1rem',
                                borderRadius: 8,
                                border: '1px solid #cfe2ff',
                            }}
                        >
                            <h4>Stage Event Data</h4>
                            <pre>{JSON.stringify(eventData.events, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default App
