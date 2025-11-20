// features/inspections/pages/SchoolInspectionPage.jsx
import React, { useMemo, useState, useCallback, useContext } from 'react'
import i18n from '@dhis2/d2-i18n'
import { TabBar, Tab, NoticeBox, Tag } from '@dhis2/ui'
import classes from '../../../App/App.module.css'
import OrgTreePanel from '../../org-units/components/OrgTreePanel'
import SchoolInspectionForm from '../components/SchoolInspectionForm'
import EditInspectionForm from '../components/EditInspectionForm'
import DeleteInspectionPanel from '../components/DeleteInspectionPanel'
import InspectionTimeline from '../../analytics/components/InspectionTimeline'
import useFetchOrgUnits from '../../org-units/hooks/useFetchOrgUnits'
import Result from '../components/inspection_result/Result'
import InspectionContext from '../../../context/InspectionContext'
import AggregatedAnalyticsPanel from '../../analytics/components/AggregatedAnalyticsPanel'

function EventSummary({ event }) {
    if (!event) return null
    const date = new Date(event.eventdate)

    return (
        <div
            style={{
                margin: '12px 0',
                padding: '10px 12px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
            }}
        >
            <strong style={{ marginRight: 8 }}>{i18n.t('Selected event')}</strong>
            <Tag positive>{date.toLocaleDateString()}</Tag>
            <Tag>{i18n.t('Status')}: {event.eventstatus}</Tag>
            {'DO0LBJfXY00' in event && (
                <Tag>
                    {i18n.t('Learners')}: {event.DO0LBJfXY00 ?? '–'}
                </Tag>
            )}
            {'jcC1uz56IpY' in event && (
                <Tag>
                    {i18n.t('Seats')}: {event.jcC1uz56IpY ?? '–'}
                </Tag>
            )}
            <span style={{ marginLeft: 'auto', color: '#64748b' }}>ID: {event.psi}</span>
        </div>
    )
}




function Header({isCluster, data}){

    const inspection ='School Inspection'
    const analytics = 'Analytics'

    const ou = data?.ou
    const orgUnitId = ou?.id

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 10,
            }}
        >
            <h2 style={{ margin: 0 }}>
                {i18n.t(isCluster ? analytics: inspection)}
            </h2>
            {orgUnitId && (
                <>
                    <span style={{ color: '#64748b' }}>•</span>
                    <div style={{ color: '#334155' }}>
                        <strong>{ou?.displayName || ou?.name}</strong>
                        <span style={{ marginLeft: 8, color: '#64748b' }}>({orgUnitId})</span>
                    </div>
                </>
            )}
        </div>
    )
}



function InspectionPanel({selected, activeTab, setActiveTab, selectedEvent, setSelectedEvent, data}){

    const ou = data?.ou
    const orgUnitId = ou?.id
    const orgUnitName = ou?.displayName || ou?.name


    return (
                    <>
                        {/* Tabs */}
                        <TabBar>
                            <Tab
                                selected={activeTab === 'submit'}
                                onClick={() => setActiveTab('submit')}
                            >
                                {i18n.t('New inspection')}
                            </Tab>
                            <Tab
                                selected={activeTab === 'edit'}
                                onClick={() => setActiveTab('edit')}
                            >
                                {i18n.t('Edit inspections')}
                            </Tab>

                            <Tab
                                selected={activeTab === 'tldr'}
                                onClick={() => setActiveTab('tldr')}
                            >
                                {i18n.t('History')}
                            </Tab>
                        </TabBar>

                        {/* Content per tab */}
                        <div style={{ marginTop: 16 }}>
                            {activeTab === 'submit' && (
                                <div>
                                    <SchoolInspectionForm
                                        orgUnitId={orgUnitId}
                                        orgUnitName={orgUnitName}
                                        setActiveTab={setActiveTab}
                                    />
                                </div>
                            )}

                            {activeTab !== 'submit' && activeTab !== 'tldr' && (
                                <>
                                    <div style={{ marginBottom: 12 }}>
                                        <InspectionTimeline
                                            key={orgUnitId}
                                            schoolId={orgUnitId}
                                            onSelect={ev => setSelectedEvent(ev)}
                                        />
                                    </div>

                                    <EventSummary event={selectedEvent} />

                                    {activeTab === 'edit' && (
                                        selectedEvent ? (
                                            <EditInspectionForm
                                                event={selectedEvent}
                                                orgUnitId={orgUnitId}
                                                orgUnitName={orgUnitName}
                                                onDeleted={() => setSelectedEvent(null)}
                                            />
                                        ) : (
                                            <NoticeBox title={i18n.t('Select an event')}>
                                                {i18n.t('Pick an event in the table above to edit.')}
                                            </NoticeBox>
                                        )
                                    )}

                                    {activeTab === 'delete' && (
                                        selectedEvent
                                            ? (
                                                <DeleteInspectionPanel event={selectedEvent} />
                                            ) : (
                                                <NoticeBox title={i18n.t('Select an event')}>
                                                    {i18n.t('Pick an event in the table above to delete.')}
                                                </NoticeBox>
                                            )
                                    )}
                                </>
                            )}

                            {activeTab === 'tldr' && (
                                <Result OrgId={selected} />
                            )}
                        </div>
                    </>
                )
}




export default function SchoolInspectionPage() {
    const ROOTS = useMemo(() => [
        { id: 'Bp3y61WbHwn', label: 'Kanifing' },
        { id: 'RlPlK44dtoo', label: 'Banjul' },
    ], [])

    const [selected, setSelected] = useState([])
    const [activeTab, setActiveTab] = useState('submit')
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const { data, selectedId } = useFetchOrgUnits(selected)
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext) // eslint-disable-line

    const handleRootChange = useCallback(() => {
        setSelected([])
        setSelectedEvent(null)
        setActiveTab('submit')
    }, [])

    const handleSelect = useCallback((ids) => {
        setSelected(ids)
        setActiveTab('submit')
        setSelectedEvent(null)
        // lukk panel på mobil når man har valgt en skole
        setMobileSidebarOpen(false)
    }, [])

    const ou = data?.ou
    const orgUnitId = ou?.id
    const isAggregate = ou?.children && data.ou.children.length > 0

    return (
        <div className={classes.container}>
            {/* Sidebar / org tree */}
            <aside className={classes.sidebar}>
                {/* Desktop-versjon: alltid synlig */}
                <div className={classes.sidebarDesktop}>
                    <OrgTreePanel
                        roots={ROOTS}
                        initialRootId={ROOTS[0].id}
                        onRootChange={handleRootChange}
                        onSelect={handleSelect}
                    />
                </div>

                {/* Mobil-versjon: kollapsbar */}
                <div className={classes.sidebarMobile}>
                    <button
                        type="button"
                        className={classes.sidebarMobileToggle}
                        onClick={() =>
                            setMobileSidebarOpen((open) => !open)
                        }
                    >
                        <span>{i18n.t('Organisation units')}</span>
                        <span>{mobileSidebarOpen ? '▲' : '▼'}</span>
                    </button>

                    {mobileSidebarOpen && (
                        <div className={classes.sidebarMobileBody}>
                            <OrgTreePanel
                                roots={ROOTS}
                                initialRootId={ROOTS[0].id}
                                onRootChange={handleRootChange}
                                onSelect={handleSelect}
                            />
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main className={classes.content}>
                <Header isCluster={isAggregate} data={data} />

                {!selectedId && (
                    <NoticeBox title={i18n.t('Pick a School or Cluster')}>
                        {i18n.t('Search for a school in the searchbar or Select a node in the tree to continue.')}
                    </NoticeBox>
                )}


                {selectedId && isAggregate && (
                    <AggregatedAnalyticsPanel data={data} />
                )}

                {selectedId && !isAggregate && (
                    <InspectionPanel
                        selected={selected}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        selectedEvent={selectedEvent}
                        setSelectedEvent={setSelectedEvent}
                        data={data}
                    />
                )}
            </main>
        </div>
    )
}