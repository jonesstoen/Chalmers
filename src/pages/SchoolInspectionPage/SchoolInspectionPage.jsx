import React, {
    useMemo,
    useState,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react'
import i18n from '@dhis2/d2-i18n'
import { TabBar, Tab, NoticeBox, Tag, CircularLoader } from '@dhis2/ui'
import { useNavigate, useLocation } from 'react-router-dom'
import classes from '../../App/App.module.css'
import pageClasses from './SchoolInspectionPage.module.css'
import OrgTreePanel from './components/OrgTreePanel'
import SchoolSearchBar from '../LandingPage/components/SchoolSearchBar'
import SchoolInspectionForm from './newInspection/SchoolInspectionForm'
import EditInspectionForm from './editInspection/EditInspectionForm'
import DeleteInspectionPanel from './editInspection/DeleteInspectionPanel'
import InspectionTimeline from './history/components/InspectionTimeline'
import useFetchOrgUnits from './api/useFetchOrgUnits'
import Result from './history/Result'
import InspectionContext from '../../context/InspectionContext'
import AggregatedAnalyticsPanel from './history/components/AggregatedAnalyticsPanel'

function EventSummary({ event }) {
    if (!event) return null
    const date = new Date(event.eventdate)

    return (
        <div
            style={{
                margin: '16px 0',
                padding: '16px',
                background: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
        >
            <strong style={{ 
                marginRight: 8,
                fontSize: 14,
                color: '#0f172a',
            }}>
                {i18n.t('Selected event')}:
            </strong>
            <Tag positive>{date.toLocaleDateString()}</Tag>
            <Tag>
                {i18n.t('Status')}: {event.eventstatus}
            </Tag>
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
            <span style={{ 
                marginLeft: 'auto', 
                color: '#64748b',
                fontSize: 12,
            }}>
                ID: {event.psi}
            </span>
        </div>
    )
}

function Header({ isCluster, data, onBack }) {
    const inspection = 'School Inspection'
    const analytics = 'Analytics'

    const ou = data?.ou
    const orgUnitId = ou?.id

    return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                }}
            >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                }}
            >
                <h2 style={{ 
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#0f172a',
                }}>
                    {i18n.t(isCluster ? analytics : inspection)}
                </h2>
                {orgUnitId && (
                    <>
                        <span style={{ color: '#64748b' }}>•</span>
                        <div style={{ 
                            color: '#334155',
                            fontSize: 16,
                        }}>
                            <strong>{ou?.displayName || ou?.name}</strong>
                            <span
                                style={{
                                    marginLeft: 8,
                                    color: '#64748b',
                                    fontSize: 14,
                                }}
                            >
                                ({orgUnitId})
                            </span>
                        </div>
                    </>
                )}
            </div>

            {onBack && (
                <button
                    type="button"
                    className={pageClasses.backButton}
                    onClick={onBack}
                    aria-label={i18n.t('Back to overview')}
                >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
                    <span>{i18n.t('Back to overview')}</span>
                </button>
            )}
        </div>
    )
}

function InspectionPanel({
                             selected,
                             activeTab,
                             setActiveTab,
                             selectedEvent,
                             setSelectedEvent,
                             data,
                         }) {
    const ou = data?.ou
    const orgUnitId = ou?.id
    const orgUnitName = ou?.displayName || ou?.name

    // Show loading if org unit data not ready
    if (!ou || !orgUnitId) {
        return (
            <NoticeBox title={i18n.t('Loading school information')}>
                {i18n.t('Please wait while school information is being loaded...')}
            </NoticeBox>
        )
    }

    return (
        <>
            <div style={{ marginBottom: 16 }}>
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
            </div>


            <div style={{ marginTop: 16 }}>
                {activeTab === 'submit' && (
                    <SchoolInspectionForm
                        orgUnitId={orgUnitId}
                        orgUnitName={orgUnitName}
                        setActiveTab={setActiveTab}
                    />
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

                        {activeTab === 'edit' &&
                            (selectedEvent ? (
                                <EditInspectionForm
                                    event={selectedEvent}
                                    orgUnitId={orgUnitId}
                                    orgUnitName={orgUnitName}
                                    onDeleted={() => setSelectedEvent(null)}
                                />
                            ) : (
                                <NoticeBox title={i18n.t('Select an event')}>
                                    {i18n.t(
                                        'Pick an event in the table above to edit.'
                                    )}
                                </NoticeBox>
                            ))}

                        {activeTab === 'delete' &&
                            (selectedEvent ? (
                                <DeleteInspectionPanel event={selectedEvent} />
                            ) : (
                                <NoticeBox title={i18n.t('Select an event')}>
                                    {i18n.t(
                                        'Pick an event in the table above to delete.'
                                    )}
                                </NoticeBox>
                            ))}
                    </>
                )}

                {activeTab === 'tldr' && <Result OrgId={selected} />}
            </div>
        </>
    )
}

export default function SchoolInspectionPage() {
    const ROOTS = useMemo(
        () => [
            { id: 'Bp3y61WbHwn', label: 'Kanifing' },
            { id: 'RlPlK44dtoo', label: 'Banjul' },
        ],
        []
    )

    const [selected, setSelected] = useState([])
    const [activeTab, setActiveTab] = useState('submit')
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const orgTreePanelRef = useRef(null)

    const { data, selectedId, loading: orgUnitLoading, error: orgUnitError } = useFetchOrgUnits(selected)
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext) // eslint-disable-line

    const navigate = useNavigate()
    const location = useLocation()

    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    )
    const initialOuFromQuery = searchParams.get('ou')

    useEffect(() => {
        if (initialOuFromQuery && selected.length === 0) {
            setSelected([initialOuFromQuery])
            setActiveTab('submit')
            setSelectedEvent(null)
        }
    }, [initialOuFromQuery, selected.length])

    // Hver gang en skole er valgt, lagre lastOu automatisk
    useEffect(() => {
        if (!selectedId || !data?.ou) return
        const ou = data.ou
        const isAggregate = ou.children && ou.children.length > 0
        if (!isAggregate && typeof window !== 'undefined') {
            window.localStorage.setItem('lastOu', selectedId)
        }
    }, [selectedId, data])

    const handleRootChange = useCallback(() => {
        setSelected([])
        setSelectedEvent(null)
        setActiveTab('submit')
    }, [])

    const handleSelect = useCallback(ids => {
        setSelected(ids)
        setActiveTab('submit')
        setSelectedEvent(null)
        setMobileSidebarOpen(false)
    }, [])

    const ou = data?.ou
    // isAggregate is true if the org unit has children (it's a cluster, not a school)
    const isAggregate = !!(ou?.children && Array.isArray(ou.children) && ou.children.length > 0)

    const handleBackToLanding = useCallback(() => {
        navigate('/')
    }, [navigate])

    const handleSearchSelect = useCallback((school) => {
        if (orgTreePanelRef.current?.handleSearchPick) {
            orgTreePanelRef.current.handleSearchPick(school)
        }
    }, [])

    return (
        <div className={pageClasses.pageWrapper}>
            {/* School Search Bar - standalone element */}
            <div style={{
                width: '100%',
                position: 'relative',
                marginBottom: 16,
            }}>
                <SchoolSearchBar onSelect={handleSearchSelect} />
            </div>

            <div className={classes.container} style={{ padding: 0 }}>
                {/* Sidebar / org tree */}
                <aside className={classes.sidebar}>
                <div className={classes.sidebarDesktop}>
                    <OrgTreePanel
                        ref={orgTreePanelRef}
                        roots={ROOTS}
                        initialRootId={ROOTS[0].id}
                        onRootChange={handleRootChange}
                        onSelect={handleSelect}
                    />
                </div>

                <div className={classes.sidebarMobile}>
                    <button
                        type="button"
                        className={classes.sidebarMobileToggle}
                        onClick={() => setMobileSidebarOpen(open => !open)}
                        aria-expanded={mobileSidebarOpen}
                        aria-label={mobileSidebarOpen ? i18n.t('Hide organisation units') : i18n.t('Show organisation units')}
                    >
                        <span style={{ fontWeight: 600 }}>{i18n.t('Organisation units')}</span>
                        <span style={{ fontSize: 12, transition: 'transform 0.2s', transform: mobileSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▼
                        </span>
                    </button>

                    {mobileSidebarOpen && (
                        <div className={classes.sidebarMobileBody}>
                            <OrgTreePanel
                                ref={orgTreePanelRef}
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
                <Header
                    isCluster={isAggregate}
                    data={data}
                    onBack={handleBackToLanding}
                />

                {(() => {
                    if (!selectedId) {
                        return (
                            <NoticeBox title={i18n.t('Pick a School or Cluster')}>
                                {i18n.t(
                                    'Search for a school in the searchbar or Select a node in the tree to continue.'
                                )}
                            </NoticeBox>
                        )
                    }
                    if (orgUnitLoading) {
                        return (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '20px',
                                background: '#ffffff',
                                borderRadius: 12,
                                border: '2px solid #e5e7eb',
                            }}>
                                <CircularLoader small />
                                <span style={{ color: '#475569', fontWeight: 500 }}>
                                    {i18n.t('Loading school information...')}
                                </span>
                            </div>
                        )
                    }
                    if (orgUnitError) {
                        return (
                            <NoticeBox error title={i18n.t('Error loading school')}>
                                {orgUnitError.message || i18n.t('Failed to load school information')}
                            </NoticeBox>
                        )
                    }
                    if (data?.ou && isAggregate) {
                        return <AggregatedAnalyticsPanel data={data} />
                    }
                    if (data?.ou && !isAggregate) {
                        return (
                            <InspectionPanel
                                selected={selected}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                selectedEvent={selectedEvent}
                                setSelectedEvent={setSelectedEvent}
                                data={data}
                            />
                        )
                    }
                    return (
                        <NoticeBox warning title={i18n.t('No data available')}>
                            {i18n.t('School information could not be loaded. Please try selecting the school again.')}
                        </NoticeBox>
                    )
                })()}
            </main>
            </div>
        </div>
    )
}