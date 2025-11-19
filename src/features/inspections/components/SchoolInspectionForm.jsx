// features/inspections/components/SchoolInspectionForm.jsx

import React, { useContext, useEffect, useState } from 'react'
import {
    Button,
    InputField,
    CircularLoader,
    AlertStack,
    AlertBar,
} from '@dhis2/ui'
import usePostSchoolInspectionEvent from '../hooks/usePostSchoolInspectionEvent'
import InspectionContext from '../../../context/InspectionContext'
import {
    SCHOOL_INSPECTION_FIELDS,
    FACILITY_IDS,
    CAPACITY_IDS,
    SANITATION_IDS,
} from '../configs/schoolInspectionConfig'
import {
    computeTotalToilets,
    validateSchoolInspection,
    computeProgress,
    normalizeChange,
} from '../configs/inspectionFormUtils'
import BooleanChoiceField from './BooleanChoiceField'
import ConditionRatingField from './ConditionRatingField'

export default function SchoolInspectionForm({ orgUnitId, orgUnitName, setActiveTab }) {
    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [lastSubmitted, setLastSubmitted] = useState([])
    const [isFormValid, setIsFormValid] = useState(false)

    const [submitInspection, { loading, error, data }] = usePostSchoolInspectionEvent()
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext)

    const inspectionDateLabel = new Date().toLocaleDateString()

    useEffect(() => {
        if (data) {
            setFormState({})
            setErrors({})
            setIsFormValid(false)
        }
    }, [data])

    const handleChange = (id, value) => {
        const normalized = normalizeChange(id, value)
        setFormState(prev => ({ ...prev, [id]: normalized }))
    }

    const totalToilets = computeTotalToilets(formState)

    const validateForm = () => {
        const newErrors = validateSchoolInspection(formState)
        setErrors(newErrors)
        const ok = Object.keys(newErrors).length === 0
        setIsFormValid(ok)
        return ok
    }

    // valider fortløpende slik at Submit-knappen enable/disable oppdateres
    useEffect(() => {
        validateForm()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState])

    const handleSubmit = async () => {
        if (!validateForm()) return

        const dataValuesArray = SCHOOL_INSPECTION_FIELDS.reduce((acc, field) => {
            const parentId = field.id
            const parentValue = formState[parentId]

            if (parentValue === undefined || parentValue === null) return acc

            acc.push({
                dataElement: parentId,
                value: field.type === 'BOOLEAN' ? !!parentValue : parentValue,
            })

            if (field.child_query) {
                const childId = field.child_query.id
                const childValue = formState[childId]

                if (parentValue === true && childValue) {
                    acc.push({ dataElement: childId, value: childValue })
                }
            }

            return acc
        }, [])

        // auto-computed toilets
        dataValuesArray.push({
            dataElement: 'iytoDmoTUWY',
            value: totalToilets,
        })

        setLastSubmitted(dataValuesArray)
        setInspectionDict(prev => ({ ...prev, [orgUnitId]: dataValuesArray }))

        await submitInspection({
            orgUnit_id: orgUnitId,
            dataValues: dataValuesArray,
        })

        if (setActiveTab) setActiveTab('tldr')
    }

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    const renderField = ({ id, label, type, child_query }) => {
        const value = formState[id]
        const hasChild = !!child_query

        const childId = child_query?.id
        const childValue = childId ? formState[childId] : null
        const numericChildValue =
            childValue !== undefined && childValue !== null && childValue !== ''
                ? Number(childValue)
                : null

        const isTrue = value === true || value === 'true'

        // BOOLEAN with condition rating (1–5)
        if (type === 'BOOLEAN' && hasChild) {
            return (
                <div key={id} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <BooleanChoiceField
                            label={label}
                            value={value}
                            onChange={v => {
                                // Oppdater availability
                                handleChange(id, v)

                                // 👇 hvis man velger "Not available", nullstill condition
                                if (v === false || v === 'false') {
                                    handleChange(childId, null)
                                }
                            }}
                            error={errors[id]}
                            trueLabel="Available"
                            falseLabel="Not available"
                        />

                        <ConditionRatingField
                            label={child_query.label}
                            // ingen default – ingen blå knapp før bruker trykker
                            value={numericChildValue}
                            onChange={num => handleChange(childId, num)}
                            disabled={!isTrue}
                            error={errors[childId]}
                        />
                    </div>
                </div>
            )
        }

        // Regular BOOLEAN → Yes/No choice
        if (type === 'BOOLEAN') {
            return (
                <div key={id} style={{ marginBottom: '1rem' }}>
                    <BooleanChoiceField
                        label={label}
                        value={value}
                        onChange={v => handleChange(id, v)}
                        error={errors[id]}
                    />
                </div>
            )
        }

        // Numeric input
        return (
            <div key={id} style={{ marginBottom: '1rem' }}>
                <InputField
                    label={label}
                    type="number"
                    min="0"
                    value={formState[id] ?? ''}
                    onChange={({ value }) => handleChange(id, value)}
                    error={errors[id]}
                />
            </div>
        )
    }

    const facilities = SCHOOL_INSPECTION_FIELDS.filter(f => FACILITY_IDS.includes(f.id))
    const capacity = SCHOOL_INSPECTION_FIELDS.filter(f => CAPACITY_IDS.includes(f.id))
    const sanitation = SCHOOL_INSPECTION_FIELDS.filter(f => SANITATION_IDS.includes(f.id))

    return (
        <div
            style={{
                marginTop: '1rem',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <h3 style={{ margin: 0 }}>
                        School inspection – {orgUnitName || orgUnitId}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        Inspection date: {inspectionDateLabel}
                    </p>
                </div>

                <div style={{ fontSize: 12, color: '#64748b' }}>
                    {filledCount} / {totalCount} fields completed
                </div>
            </div>

            {/* progress bar */}
            <div style={{ marginBottom: 20 }}>
                <div
                    style={{
                        height: 6,
                        background: '#e5e7eb',
                        borderRadius: 999,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            background: progressPct === 100 ? '#16a34a' : '#2563eb',
                            transition: 'width .25s',
                        }}
                    />
                </div>
            </div>

            {loading && <CircularLoader small />}

            {!loading && (
                <>
                    {/* FACILITIES */}
                    <details open style={{ marginBottom: '1.25rem' }}>
                        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                            Facilities
                        </summary>
                        <p style={{ fontSize: 12, color: '#64748b' }}>
                            Select if available and rate condition from 1–5.
                        </p>
                        {facilities.map(renderField)}
                    </details>

                    {/* CAPACITY */}
                    <details open style={{ marginBottom: '1.25rem' }}>
                        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                            Capacity
                        </summary>
                        {capacity.map(renderField)}
                    </details>

                    {/* SANITATION */}
                    <details open>
                        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                            Sanitation & staffing
                        </summary>
                        {sanitation.map(renderField)}

                        <strong style={{ display: 'block', marginTop: 10 }}>
                            Total toilets: {totalToilets}
                        </strong>
                    </details>

                    {/* Footer Submit */}
                    <div
                        style={{
                            marginTop: '2rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button
                            primary
                            onClick={handleSubmit}
                            // 🔹 disable så lenge form ikke er valid
                            disabled={loading || !isFormValid}
                        >
                            Submit inspection
                        </Button>
                    </div>

                    {/* Alerts */}
                    {data && (
                        <AlertStack>
                            <AlertBar success duration={5000}>
                                Submitted successfully ({lastSubmitted.length} fields)
                            </AlertBar>
                        </AlertStack>
                    )}

                    {error && (
                        <AlertBar critical>
                            {error.message || 'Unexpected error'}
                        </AlertBar>
                    )}
                </>
            )}
        </div>
    )
}