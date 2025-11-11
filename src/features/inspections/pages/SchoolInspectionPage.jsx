// features/inspections/pages/SchoolInspectionPage.jsx
import React, { useMemo, useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import { TabBar, Tab } from '@dhis2/ui'
import classes from '../../../App/App.module.css'
import OrgTreePanel from '../../org-units/components/OrgTreePanel'
import SchoolInspectionForm from '../components/SchoolInspectionForm'
import EditInspectionForm from '../components/EditInspectionForm'
import DeleteInspectionPanel from '../components/DeleteInspectionPanel'
import InspectionTimeline from '../../analytics/components/InspectionTimeline'
import useFetchOrgUnits from '../../org-units/hooks/useFetchOrgUnits'

export default function SchoolInspectionPage() {
    const ROOTS = useMemo(() => [
        { id: 'Bp3y61WbHwn', label: 'Kanifing' },
        { id: 'RlPlK44dtoo', label: 'Banjul' },
    ], [])

    const [selected, setSelected] = useState([])   // [orgUnitId]
    const [activeTab, setActiveTab] = useState('submit') // submit | edit | delete
    const [selectedEvent, setSelectedEvent] = useState(null) // fra timeline

    const handleRootChange = useCallback(() => {
        setSelected([])
        setSelectedEvent(null)
    }, [])

    const handleSelect = useCallback((ids) => {
        setSelected(ids)
        setSelectedEvent(null)
    }, [])

    const { data, selectedId } = useFetchOrgUnits(selected)
    const orgUnitId = data?.ou?.id

    return (
        <div className={classes.container}>
            <OrgTreePanel
                roots={ROOTS}
                initialRootId={ROOTS[0].id}
                onRootChange={handleRootChange}
                onSelect={handleSelect}
            />

            <main className={classes.content}>
                <h2 style={{ marginTop: 0 }}>{i18n.t('School Inspection')}</h2>
                {!selectedId && <p>{i18n.t('Pick a school in the tree to continue.')}</p>}

                {selectedId && (
                    <>
                        {/* Tabs */}
                        <TabBar>
                            <Tab selected={activeTab === 'submit'} onClick={() => setActiveTab('submit')}>
                                {i18n.t('Submit')}
                            </Tab>
                            <Tab selected={activeTab === 'edit'} onClick={() => setActiveTab('edit')}>
                                {i18n.t('Edit')}
                            </Tab>
                            <Tab selected={activeTab === 'delete'} onClick={() => setActiveTab('delete')}>
                                {i18n.t('Delete')}
                            </Tab>
                        </TabBar>

                        {/* Content per tab */}
                        <div style={{ marginTop: 16 }}>
                            {activeTab === 'submit' && (
                                <div>
                                    <SchoolInspectionForm orgUnitId={orgUnitId} />
                                </div>
                            )}

                            {activeTab !== 'submit' && (
                                <>
                                    <div style={{ marginBottom: 12 }}>
                                        {/* Timeline med velgbar rad */}
                                        <InspectionTimeline
                                            schoolId={orgUnitId}
                                            onSelect={(ev) => setSelectedEvent(ev)}
                                        />
                                    </div>

                                    {activeTab === 'edit' && (
                                        <EditInspectionForm
                                            event={selectedEvent}
                                        />
                                    )}

                                    {activeTab === 'delete' && (
                                        <DeleteInspectionPanel
                                            event={selectedEvent}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}