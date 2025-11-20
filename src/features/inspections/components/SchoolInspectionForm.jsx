// features/inspections/components/SchoolInspectionForm.jsx
import React, { useContext, useEffect, useState } from 'react'
import {
    Button,
    InputField,
    CheckboxField,
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

export default function SchoolInspectionForm({ orgUnitId, orgUnitName, setActiveTab }) {
    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [lastSubmitted, setLastSubmitted] = useState([])
    const [submitInspection, { loading, error, data }] = usePostSchoolInspectionEvent()
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext)
    const inspectionDateLabel = new Date().toLocaleDateString()

    useEffect(() => {
        if (data) {
            setFormState({})
            setErrors({})
        }
    }, [data])

    const handleChange = (id, value) => {
        const newValue = normalizeChange(id, value)
        setFormState(prev => ({ ...prev, [id]: newValue }))
    }

    const totalToilets = computeTotalToilets(formState)

    const validateForm = () => {
        const newErrors = validateSchoolInspection(formState)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const dataValuesArray = SCHOOL_INSPECTION_FIELDS.reduce((acc, field) => {
            const parentId = field.id
            const parentValue = formState[parentId]

            if (parentValue === undefined || parentValue === null) return acc

            if (field.type === 'BOOLEAN') {
                acc.push({ dataElement: parentId, value: !!parentValue })
            } else {
                acc.push({ dataElement: parentId, value: parentValue })
            }

            if (field.child_query) {
                const childId = field.child_query.id
                const childValue = formState[childId]

                if (
                    parentValue === true &&
                    childValue !== undefined &&
                    childValue !== null &&
                    childValue !== ''
                ) {
                    acc.push({ dataElement: childId, value: childValue })
                }
            }

            return acc
        }, [])

        dataValuesArray.push({
            dataElement: TOTAL_TOILETS_ID,
            value: totalToilets,
        })

        setLastSubmitted(dataValuesArray)
        setInspectionDict(prev => ({
            ...prev,
            [orgUnitId]: dataValuesArray,
        }))

        await submitInspection({
            orgUnit_id: orgUnitId,
            dataValues: dataValuesArray,
        })

        if (setActiveTab) {
            setActiveTab('tldr')
        }
    }

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    const renderField = ({ id, label, type, child_query }) => (
        <div key={id} style={{ marginBottom: '0.75rem' }}>
            {type === 'BOOLEAN' ? (
                <CheckboxField
                    label={label}
                    checked={!!formState[id]}
                    onChange={() =>
                        handleChange(
                            id,
                            !(formState[id] === 'true' || formState[id] === true)
                        )
                    }
                />
            ) : (
                <InputField
                    label={label}
                    type="number"
                    min="0"
                    value={formState[id] ?? ''}
                    onChange={({ value }) => handleChange(id, value)}
                    error={errors[id]}
                />
            )}

            {child_query && formState[id] === true && (
                <div style={{ marginLeft: '1.75rem', marginTop: '0.35rem' }}>
                    <InputField
                        label={child_query.label}
                        type="number"
                        min="1"
                        max="5"
                        value={formState[child_query.id] ?? ''}
                        onChange={({ value }) => handleChange(child_query.id, value)}
                        error={errors[child_query.id]}
                    />
                </div>
            )}
        </div>
    )

    const facilities = SCHOOL_INSPECTION_FIELDS.filter(f => FACILITY_IDS.includes(f.id))
    const capacity = SCHOOL_INSPECTION_FIELDS.filter(f => CAPACITY_IDS.includes(f.id))
    const sanitation = SCHOOL_INSPECTION_FIELDS.filter(f => SANITATION_IDS.includes(f.id))

    // resten av JSX-en din (header, accordions, sticky bar, alerts) kan være identisk,
    // men nå med de nye variablene.
    // ⬇️
    return (
        <div
            style={{
                marginTop: '1rem',
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
                position: 'relative',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 12,
                    gap: 12,
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
                    {filledCount} of {totalCount} fields completed
                </div>
            </div>

            {/* progress bar */}
            <div style={{ marginBottom: 16 }}>
                <div
                    style={{
                        height: 6,
                        borderRadius: 999,
                        background: '#e5e7eb',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            borderRadius: 999,
                            transition: 'width 0.2s ease-out',
                            background:
                                progressPct === 100 ? '#16a34a' : '#2563eb',
                        }}
                    />
                </div>
            </div>

            {loading && <CircularLoader small />}

            {!loading && (
                <>
                    <details open style={{ marginBottom: '1rem' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                            Facilities
                        </summary>
                        <p
                            style={{
                                marginTop: 4,
                                marginBottom: '0.75rem',
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Check which facilities are available at the school and rate
                            condition 1–5.
                        </p>
                        {facilities.map(renderField)}
                    </details>

                    <details open style={{ marginBottom: '1rem' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                            Capacity
                        </summary>
                        <p
                            style={{
                                marginTop: 4,
                                marginBottom: '0.75rem',
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Provide numbers for classrooms, learners, seats and teachers.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    <details open style={{ marginBottom: '4rem' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                            Sanitation & staffing
                        </summary>
                        <p
                            style={{
                                marginTop: 4,
                                marginBottom: '0.75rem',
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Report toilets per group. Total toilets is calculated automatically.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                            {sanitation.map(renderField)}
                        </div>
                        <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                            <strong>Total toilets: {totalToilets}</strong>
                        </div>
                    </details>

                    <div
                        style={{
                            position: 'sticky',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            paddingTop: 8,
                            marginTop: 'auto',
                            background:
                                'linear-gradient(to top, rgba(248,250,252,0.96), rgba(248,250,252,0.85), transparent)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                                {filledCount} of {totalCount} fields completed
                            </span>
                            <Button
                                primary
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{ minWidth: 180 }}
                            >
                                Submit inspection
                            </Button>
                        </div>
                    </div>

                    {data && (
                        <AlertStack>
                            <AlertBar success duration={8000}>
                                <p>
                                    <strong>Success:</strong>{' '}
                                    {`Data posted with num fields: ${lastSubmitted.length}`}
                                </p>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {error && (
                        <div style={{ color: 'red', marginTop: '1rem' }}>
                            <p>
                                <strong>Error:</strong>{' '}
                                {error.message || 'An unexpected error occurred'}
                            </p>
                            {error.code && (
                                <p>
                                    <strong>Code:</strong> {error.code}
                                </p>
                            )}
                            {error.details && (
                                <pre>{JSON.stringify(error.details, null, 2)}</pre>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}