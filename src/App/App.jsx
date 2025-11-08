import React, { useMemo, useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import OrgTreePanel from '../features/org-units/components/OrgTreePanel'
import SchoolInfoCard from '../features/org-units/components/SchoolInfoCard'
import SeatToLearnerList from '../components/SeatToLearnerList'
import AnalyticsTable from '../features/analytics/components/AnalyticsTable'
import useFetchOrgUnits from '../features/org-units/hooks/useFetchOrgUnits'
import useFetchAnalytics from '../features/analytics/api/analyticsAPI'
import SchoolInspectionForm from "../features/inspections/components/SchoolInspectionForm";
import AnalyticsSection from '../features/analytics/components/AnalyticsSection'

export default function App() {
    const ROOTS = useMemo(() => [
        { id: 'Bp3y61WbHwn', label: 'Kanifing' },
        { id: 'RlPlK44dtoo', label: 'Banjul' },
    ], [])

    const [selected, setSelected] = useState([])   // [orgUnitId]
    const [activeProgram, setActiveProgram] = useState(null)
    const [activeStage, setActiveStage] = useState(null)

    // ---- stable handlers (prevents effect loops) ----
    const handleRootChange = useCallback(() => {
        setSelected([])
        setActiveProgram(null)
        setActiveStage(null)
    }, [])

    const handleSelect = useCallback((ids) => {
        setSelected(ids)
        setActiveProgram(null)
        setActiveStage(null)
    }, [])

    const { data, loading, error, selectedId } = useFetchOrgUnits(selected)

    const orgUnitId = data?.ou?.id





    const isAggregate = (data?.ou?.level ?? Infinity) < 5

    // when activeProgram is null, the hook will not fetch
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