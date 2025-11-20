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
    TOTAL_TOILETS_ID,
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

    const sectionBoxStyle = {
        background: "#fafafa",
        padding: "16px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        marginBottom: "1.5rem",
    }
    const sectionGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        columnGap: 16,
        rowGap: 12,
        gap: 20,
        alignItems: 'flex-start',
        maxWidth: 960,         // on laptop
        marginTop: 4,
        marginBottom: 4,
    }
    const numberFieldContainerStyle = {
        marginBottom: '0.75rem',
        maxWidth: 320,
        width: '100%',
    }

    const numberLabelStyle = {
        display: 'block',
        marginBottom: 4,
        fontSize: 13,
        fontWeight: 500,
        minHeight: 32,
        color: '#0f172a',
    }

    const numberInputStyle = {
        width: '100%',
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid #cbd5e1',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
    }

    const numberInputFocusStyle = {
        ...numberInputStyle,
        border: '1px solid #2563eb',
        boxShadow: '0 0 0 1px rgba(37,99,235,0.2)',
    }
    function NumberField({ label, value, onChange, error }) {
        const [isFocused, setIsFocused] = React.useState(false)

        return (
            <div style={numberFieldContainerStyle}>
                <label style={numberLabelStyle}>{label}</label>
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={isFocused ? numberInputFocusStyle : numberInputStyle}
                />
                {error && (
                    <p
                        style={{
                            marginTop: 4,
                            marginBottom: 0,
                            fontSize: 12,
                            color: '#b91c1c',
                        }}
                    >
                        {error}
                    </p>
                )}
            </div>
        )
    }

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

    // validerer fortløpende slik at Submit-knappen enable/disable oppdateres
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

        // auto computed toilets
        dataValuesArray.push({
            dataElement: TOTAL_TOILETS_ID,
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

        // BOOLEAN with condition rating
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

                                // hvis man velger "Not available", nullstilles condition
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
                            value={numericChildValue}
                            onChange={num => handleChange(childId, num)}
                            disabled={!isTrue}
                            error={errors[childId]}
                        />
                    </div>
                </div>
            )
        }

        // Regular BOOLEAN  Yes/No choice
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

        //  Numeric input
        const numericValue = formState[id] ?? ''
        return (
            <NumberField
                key={id}
                label={label}
                value={numericValue}
                onChange={val => handleChange(id, val)}
                error={errors[id]}
            />
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
                    <details open style={sectionBoxStyle}>
                        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                            Facilities
                        </summary>
                        <p style={{ fontSize: 12, color: '#64748b' }}>
                            Select if available and rate condition from 1–5.
                        </p>
                        {facilities.map(renderField)}
                    </details>

                    {/* CAPACITY */}
                    <details open style={sectionBoxStyle}>
                        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                            Capacity
                        </summary>
                        <p
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginTop: 4,
                                marginBottom: 12,
                            }}
                        >
                            Enter basic counts for classrooms, learners, seats and teachers.
                        </p>

                        <div style={sectionGridStyle}>
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    {/* SANITATION */}
                    <details open style={sectionBoxStyle}>
                        <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                            Sanitation & staffing
                        </summary>
                        <p
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginTop: 4,
                                marginBottom: 12,
                            }}
                        >
                            Report toilets per group. Total toilets is calculated automatically.
                        </p>

                        <div style={sectionGridStyle}>
                            {sanitation.map(renderField)}
                        </div>

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
                            // disable så lenge form ikke er valid
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
