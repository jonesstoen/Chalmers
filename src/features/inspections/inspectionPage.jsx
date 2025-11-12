// features/inspect/InspectPage.jsx
import React, { useMemo, useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import classes from '../../App/App.module.css'
import OrgTreePanel from '../org-units/components/OrgTreePanel'
import SchoolInfoCard from '../org-units/components/SchoolInfoCard' // (valgfritt – ikke brukt i koden under)
import SeatToLearnerList from '../../components/SeatToLearnerList'  // (valgfritt – ikke brukt i koden under)
import AnalyticsTable from '../analytics/components/AnalyticsTable'
import useFetchOrgUnits from '../org-units/hooks/useFetchOrgUnits'
import useFetchAnalytics from '../analytics/api/analyticsAPI'
import SchoolInspectionForm from "../inspections/components/SchoolInspectionForm"

export default function inspectionPage() {
    const ROOTS = useMemo(() => [
        { id: 'Bp3y61WbHwn', label: 'Kanifing' },
        { id: 'RlPlK44dtoo', label: 'Banjul' },
    ], [])

    const [selected, setSelected] = useState([])   // [orgUnitId]
    const [activeProgram, setActiveProgram] = useState(null)
    const [activeStage, setActiveStage] = useState(null)

    const handleRootChange = useCallback(() => {
        setSelected([])
        setActiveProgram(null)
        setActiveStage(null)
    }, [])

    const handleSelect = useCallback((idsOrId) => {
        const arr = Array.isArray(idsOrId) ? idsOrId : [idsOrId]
        const last = arr[arr.length - 1]
        setSelected(last ? [last] : [])
        setActiveProgram(null)
        setActiveStage(null)
    }, [])

    const { data, loading, error, selectedId } = useFetchOrgUnits(selected)
    const orgUnitId = data?.ou?.id
    const isAggregate = (data?.ou?.level ?? Infinity) < 5

    const { data: analyticsData, loading: analyticsLoading, error: analyticsError } =
        useFetchAnalytics(activeProgram, { stage: activeStage }, [], selected, { descendants: isAggregate })

    return (
        <div className={classes.container}>
            <OrgTreePanel
                roots={ROOTS}
                initialRootId={ROOTS[0].id}
                onRootChange={handleRootChange}
                onSelect={handleSelect}
            />

            <main className={classes.content}>
                <h2 style={{ marginTop: 0 }}>{i18n.t('Select a school')}</h2>
                {!selectedId && <p>{i18n.t('Pick a node in the tree to see details.')}</p>}

                {selectedId && data?.ou && (
                    <>
                        <SchoolInspectionForm orgUnitId={orgUnitId} />

                        {activeStage && (
                            <div style={{ marginTop: '1.5rem', background: '#eef6ff', padding: '1rem', borderRadius: 8, border: '1px solid #cfe2ff' }}>
                                <h4>{i18n.t('Analytics')}</h4>
                                <AnalyticsTable data={analyticsData} loading={analyticsLoading} error={analyticsError} />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}