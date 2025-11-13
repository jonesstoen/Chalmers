import React, { useMemo, useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, NoticeBox, IconEdit16, IconAdd16, IconDelete16, Tag } from '@dhis2/ui'
import classes from '../../../App/App.module.css'
import OrgTreePanel from '../../org-units/components/OrgTreePanel'
import SchoolInspectionForm from '../components/SchoolInspectionForm'
import EditInspectionForm from '../components/EditInspectionForm'
import DeleteInspectionPanel from '../components/DeleteInspectionPanel'
import InspectionTimeline from '../../analytics/components/InspectionTimeline'
import useFetchOrgUnits from '../../org-units/hooks/useFetchOrgUnits'

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
            {'DO0LBJfXY00' in event && <Tag>{i18n.t('Learners')}: {event.DO0LBJfXY00 ?? '–'}</Tag>}
            {'jcC1uz56IpY' in event && <Tag>{i18n.t('Seats')}: {event.jcC1uz56IpY ?? '–'}</Tag>}
            <span style={{ marginLeft: 'auto', color: '#64748b' }}>ID: {event.psi}</span>
        </div>
    )
}

export default function SchoolInspectionPage() {
    const ROOTS = useMemo(() => [
        { id: 'Bp3y61WbHwn', label: 'Kanifing' },
        { id: 'RlPlK44dtoo', label: 'Banjul' },
    ], [])

    const [selected, setSelected] = useState([])                 // [orgUnitId]
    const [mode, setMode] = useState('submit')                  // 'submit' | 'edit' | 'delete'
    const [selectedEvent, setSelectedEvent] = useState(null)    // valgt fra timeline

    const handleRootChange = useCallback(() => {
        setSelected([])
        setSelectedEvent(null)
    }, [])

    const handleSelect = useCallback((ids) => {
        setSelected(ids)
        setSelectedEvent(null)
    }, [])

    const { data, selectedId, loading } = useFetchOrgUnits(selected)
    const ou = data?.ou
    const orgUnitId = ou?.id

    const Header = (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 10,
            }}
        >
            <h2 style={{ margin: 0 }}>{i18n.t('School Inspection')}</h2>
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

    // tab buttons
    const ModeStrip = (
        <ButtonStrip style={{ margin: '4px 0 12px' }}>
            <Button
                primary={mode === 'submit'}
                onClick={() => setMode('submit')}
                icon={<IconAdd16 />}
            >
                {i18n.t('Submit')}
            </Button>
            <Button
                primary={mode === 'edit'}
                onClick={() => setMode('edit')}
                disabled={!orgUnitId}
                icon={<IconEdit16 />}
            >
                {i18n.t('Edit')}
            </Button>
            <Button
                destructive={mode === 'delete'}
                onClick={() => setMode('delete')}
                disabled={!orgUnitId}
                icon={<IconDelete16 />}
            >
                {i18n.t('Delete')}
            </Button>
        </ButtonStrip>
    )

    return (
        <div className={classes.container}>
            <OrgTreePanel
                roots={ROOTS}
                initialRootId={ROOTS[0].id}
                onRootChange={handleRootChange}
                onSelect={handleSelect}
            />

            <main className={classes.content}>
                {Header}

                {!selectedId && (
                    <NoticeBox title={i18n.t('Pick a school')}>
                        {i18n.t('Select a node in the tree to continue.')}
                    </NoticeBox>
                )}

                {selectedId && (
                    <>
                        {ModeStrip}

                        {mode === 'submit' && (
                            <div>
                                <SchoolInspectionForm orgUnitId={orgUnitId} />
                            </div>
                        )}

                        {mode !== 'submit' && (
                            <>
                                <div style={{ marginBottom: 12 }}>
                                    <InspectionTimeline key={orgUnitId} schoolId={orgUnitId} onSelect={ev => setSelectedEvent(ev)} />
                                </div>

                                <EventSummary event={selectedEvent} />

                                {mode === 'edit' && (
                                    selectedEvent
                                        ? <EditInspectionForm event={selectedEvent} />
                                        : <NoticeBox title={i18n.t('Select an event')}>
                                            {i18n.t('Pick an event in the table above to edit.')}
                                        </NoticeBox>
                                )}

                                {mode === 'delete' && (
                                    selectedEvent
                                        ? <DeleteInspectionPanel event={selectedEvent} />
                                        : <NoticeBox title={i18n.t('Select an event')}>
                                            {i18n.t('Pick an event in the table above to delete.')}
                                        </NoticeBox>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}