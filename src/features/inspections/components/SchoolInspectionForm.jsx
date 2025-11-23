// features/inspections/components/SchoolInspectionForm.jsx

import React, { useContext, useEffect, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
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

const DRAFT_KEY_PREFIX = 'schoolInspectionDraft_'

const getDraftKey = orgUnitId =>
    orgUnitId ? `${DRAFT_KEY_PREFIX}${orgUnitId}` : null

const loadDraft = orgUnitId => {
    if (typeof window === 'undefined') return null
    const key = getDraftKey(orgUnitId)
    if (!key) return null
    try {
        const raw = window.localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch (e) {
        console.warn('Failed to load draft form state', e)
        return null
    }
}

const saveDraft = (orgUnitId, state) => {
    if (typeof window === 'undefined') return
    const key = getDraftKey(orgUnitId)
    if (!key) return
    try {
        window.localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
        console.warn('Failed to save draft form state', e)
    }
}

 // not used atm
const clearDraft = orgUnitId => {
    if (typeof window === 'undefined') return
    const key = getDraftKey(orgUnitId)
    if (!key) return
    try {
        window.localStorage.removeItem(key)
    } catch (e) {
        console.warn('Failed to clear draft form state', e)
    }
}

// --- layout styles ---
const sectionBoxStyle = {
    background: '#ffffff',
    padding: 20,
    borderRadius: 12,
    border: '2px solid #e5e7eb',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
}

const sectionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    columnGap: 20,
    rowGap: 16,
    alignItems: 'flex-start',
    maxWidth: 960,
    marginTop: 8,
    marginBottom: 8,
}

const numberFieldContainerStyle = {
    marginBottom: '1rem',
    maxWidth: 320,
    width: '100%',
}

const numberLabelStyle = {
    display: 'block',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    minHeight: 20,
    color: '#0f172a',
}

const numberInputStyle = {
    width: '100%',
    padding: '12px 14px', // Larger padding for mobile touch targets
    borderRadius: 8,
    border: '2px solid #cbd5e1',
    fontSize: 16, // Larger font for mobile readability
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: 44, // Minimum touch target size
    transition: 'all 0.2s ease',
    background: '#ffffff',
}

const numberInputFocusStyle = {
    ...numberInputStyle,
    border: '2px solid #2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
    background: '#ffffff',
}

function NumberField({ label, value = '', onChange, error }) {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
        <div style={numberFieldContainerStyle}>
            <label style={{
                ...numberLabelStyle,
                ...(error && { color: '#b91c1c' })
            }}>
                {label}
                {error && <span style={{ color: '#b91c1c', marginLeft: 4 }}>*</span>}
            </label>
            <input
                type="number"
                min="0"
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={isFocused ? numberInputFocusStyle : numberInputStyle}
                aria-invalid={!!error}
                aria-describedby={error ? `${label}-error` : undefined}
            />
            {error && (
                <p
                    id={`${label}-error`}
                    style={{
                        marginTop: 6,
                        marginBottom: 0,
                        fontSize: 12,
                        color: '#b91c1c',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}
                    role="alert"
                >
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    )
}

export default function SchoolInspectionForm({
                                                 orgUnitId,
                                                 orgUnitName,
                                                 setActiveTab,
                                             }) {
    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [lastSubmitted, setLastSubmitted] = useState([])

    const [missingRequiredLabels, setMissingRequiredLabels] = useState([])
    const [showMissingPopup, setShowMissingPopup] = useState(false)

    const [submitInspection, { loading, error, data }] =
        usePostSchoolInspectionEvent()
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext)

    const inspectionDateLabel = new Date().toLocaleDateString()


    useEffect(() => {
        if (!orgUnitId) {
            setFormState({})
            setErrors({})
            setMissingRequiredLabels([])
            setShowMissingPopup(false)
            return
        }

        const draft = loadDraft(orgUnitId)
        if (draft && typeof draft === 'object') {
            setFormState(draft)
        } else {
            setFormState({})
        }
        setErrors({})
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
    }, [orgUnitId])


    useEffect(() => {
        if (data) {
            // beholder formState + draft som det er
            setErrors({})
            setMissingRequiredLabels([])
            setShowMissingPopup(false)
        }
    }, [data])

    const handleChange = (id, value) => {
        setFormState(prev => {
            const next = { ...prev, [id]: value }
            if (orgUnitId) {
                saveDraft(orgUnitId, next)
            }
            return next
        })
    }

    const totalToilets = computeTotalToilets(formState)

    const validateForm = () => {
        const normalizedState = {}

        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            const parentId = field.id
            normalizedState[parentId] = normalizeChange(
                parentId,
                formState[parentId]
            )

            if (field.child_query) {
                const childId = field.child_query.id
                normalizedState[childId] = normalizeChange(
                    childId,
                    formState[childId]
                )
            }
        })

        const errorsFound = validateSchoolInspection(normalizedState) || {}
        const isEmpty = v => v === undefined || v === null || v === ''

        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            const id = field.id

            // skip auto-calculated field that is not user-input
            if (id === TOTAL_TOILETS_ID) {
                return
            }

            if (field.type === 'BOOLEAN') {
                if (isEmpty(normalizedState[id]) && !errorsFound[id]) {
                    errorsFound[id] = 'Required'
                }

                if (field.child_query) {
                    const childId = field.child_query.id
                    const childValue = normalizedState[childId]
                    const isTrue =
                        normalizedState[id] === true ||
                        normalizedState[id] === 'true'

                    if (
                        isTrue &&
                        isEmpty(childValue) &&
                        !errorsFound[childId]
                    ) {
                        errorsFound[childId] = 'Required'
                    }
                }
            } else if (isEmpty(normalizedState[id]) && !errorsFound[id]) {
                errorsFound[id] = 'Required'
            }
        })

        setErrors(errorsFound)

        const missingLabels = []
        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            if (field.id === TOTAL_TOILETS_ID) return

            if (errorsFound[field.id] === 'Required') {
                missingLabels.push(field.label)
            }
            if (
                field.child_query &&
                errorsFound[field.child_query.id] === 'Required'
            ) {
                missingLabels.push(field.child_query.label)
            }
        })
        setMissingRequiredLabels(missingLabels)

        const ok = Object.keys(errorsFound).length === 0
        return { ok, normalizedState }
    }

    const handleSubmit = async () => {
        const { ok, normalizedState } = validateForm()

        if (!ok) {
            setShowMissingPopup(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        const dataValuesArray = SCHOOL_INSPECTION_FIELDS.reduce(
            (acc, field) => {
                const val = normalizedState[field.id]
                if (val !== undefined && val !== null) {
                    acc.push({
                        dataElement: field.id,
                        value: field.type === 'BOOLEAN' ? !!val : val,
                    })
                }

                if (field.child_query) {
                    const childVal = normalizedState[field.child_query.id]
                    if (val === true && childVal) {
                        acc.push({
                            dataElement: field.child_query.id,
                            value: childVal,
                        })
                    }
                }
                return acc
            },
            []
        )

        // auto computed toilets
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


        if (setActiveTab) setActiveTab('tldr')
    }

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    const renderField = ({ id, label, type, child_query }) => {
        const value = formState[id]
        const childValue = child_query ? formState[child_query.id] : null
        const numericChildValue =
            childValue !== '' && childValue !== null
                ? Number(childValue)
                : null
        const isTrue = value === true || value === 'true'

        if (type === 'BOOLEAN' && child_query) {
            return (
                <div key={id} style={{ marginBottom: '1.25rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <BooleanChoiceField
                            label={label}
                            value={value}
                            onChange={v => {
                                handleChange(id, v)
                                if (!v) {
                                    handleChange(child_query.id, null)
                                }
                            }}
                            error={errors[id]}
                            trueLabel="Available"
                            falseLabel="Not available"
                        />
                        <ConditionRatingField
                            label={child_query.label}
                            value={numericChildValue}
                            onChange={num =>
                                handleChange(child_query.id, num)
                            }
                            disabled={!isTrue}
                            error={errors[child_query.id]}
                        />
                    </div>
                </div>
            )
        }

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

        return (
            <NumberField
                key={id}
                label={label}
                value={formState[id] ?? ''}
                onChange={val => handleChange(id, val)}
                error={errors[id]}
            />
        )
    }

    const facilities = SCHOOL_INSPECTION_FIELDS.filter(f =>
        FACILITY_IDS.includes(f.id)
    )
    const capacity = SCHOOL_INSPECTION_FIELDS.filter(f =>
        CAPACITY_IDS.includes(f.id)
    )
    const sanitation = SCHOOL_INSPECTION_FIELDS.filter(f =>
        SANITATION_IDS.includes(f.id)
    )

    return (
        <div
            style={{
                marginTop: '1rem',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
            }}
        >
            {/* Validation error alert */}
            {showMissingPopup && missingRequiredLabels.length > 0 && (
                <AlertStack>
                    <AlertBar
                        warning
                        duration={10000}
                        onHidden={() => setShowMissingPopup(false)}
                    >
                        <div>
                            <strong style={{ display: 'block', marginBottom: 8 }}>
                                {i18n.t('Please complete all required fields')}
                            </strong>
                            <div style={{ fontSize: 13 }}>
                                {i18n.t('The following {{count}} field(s) need to be filled:', { count: missingRequiredLabels.length })}
                            </div>
                            <ul
                                style={{
                                    margin: '8px 0 0 20px',
                                    padding: 0,
                                    fontSize: 13,
                                }}
                            >
                                {missingRequiredLabels.map(label => (
                                    <li key={label} style={{ marginBottom: 4 }}>{label}</li>
                                ))}
                            </ul>
                        </div>
                    </AlertBar>
                </AlertStack>
            )}

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
                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            color: '#64748b',
                        }}
                    >
                        Inspection date: {inspectionDateLabel}
                    </p>
                </div>
                <div
                    style={{
                        fontSize: 12,
                        color: '#64748b',
                    }}
                >
                    {filledCount} / {totalCount} fields completed
                </div>
            </div>

            {/* progress bar */}
            <div style={{ marginBottom: 24 }}>
                <div
                    style={{
                        height: 8,
                        background: '#e5e7eb',
                        borderRadius: 999,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            background:
                                progressPct === 100
                                    ? '#16a34a'
                                    : '#2563eb',
                            transition: 'width .3s ease',
                            borderRadius: 999,
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    fontSize: 12,
                    color: '#64748b',
                }}>
                    <span>Progress: {filledCount} of {totalCount} fields</span>
                    <span style={{ fontWeight: 600, color: progressPct === 100 ? '#16a34a' : '#2563eb' }}>
                        {Math.round(progressPct)}%
                    </span>
                </div>
            </div>

            {loading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px',
                    background: '#eff6ff',
                    borderRadius: 8,
                    border: '1px solid #bfdbfe',
                    marginBottom: 20,
                }}>
                    <CircularLoader small />
                    <span style={{ color: '#1e40af', fontWeight: 500 }}>
                        {i18n.t('Submitting inspection...')}
                    </span>
                </div>
            )}

            {!loading && (
                <>
                    <details open style={sectionBoxStyle}>
                        <summary
                            style={{ 
                                fontWeight: 600, 
                                fontSize: 16,
                                cursor: 'pointer',
                                color: '#0f172a',
                                marginBottom: 12,
                                padding: '4px 0',
                                listStyle: 'none',
                            }}
                        >
                            Facilities
                        </summary>
                        <p
                            style={{
                                fontSize: 13,
                                color: '#64748b',
                                marginBottom: 16,
                                lineHeight: 1.5,
                            }}
                        >
                            Select if available and rate condition from 1–5.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {facilities.map(renderField)}
                        </div>
                    </details>

                    <details open style={sectionBoxStyle}>
                        <summary
                            style={{ 
                                fontWeight: 600, 
                                fontSize: 16,
                                cursor: 'pointer',
                                color: '#0f172a',
                                marginBottom: 12,
                                padding: '4px 0',
                                listStyle: 'none',
                            }}
                        >
                            Capacity
                        </summary>
                        <p
                            style={{
                                fontSize: 13,
                                color: '#64748b',
                                marginBottom: 16,
                                lineHeight: 1.5,
                            }}
                        >
                            Enter basic counts for classrooms, learners, seats
                            and teachers.
                        </p>
                        <div style={sectionGridStyle}>
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    <details open style={sectionBoxStyle}>
                        <summary
                            style={{ 
                                fontWeight: 600, 
                                fontSize: 16,
                                cursor: 'pointer',
                                color: '#0f172a',
                                marginBottom: 12,
                                padding: '4px 0',
                                listStyle: 'none',
                            }}
                        >
                            Sanitation & staffing
                        </summary>
                        <p
                            style={{
                                fontSize: 13,
                                color: '#64748b',
                                marginBottom: 16,
                                lineHeight: 1.5,
                            }}
                        >
                            Report toilets per group. Total toilets is
                            calculated automatically.
                        </p>
                        <div style={sectionGridStyle}>
                            {sanitation.map(renderField)}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 16,
                                padding: '12px 16px',
                                background: '#eff6ff',
                                borderRadius: 8,
                                border: '1px solid #bfdbfe',
                            }}
                        >
                            <strong style={{ fontSize: 14, color: '#1e40af' }}>
                                Total toilets: 
                            </strong>
                            <span style={{ 
                                fontSize: 16, 
                                fontWeight: 700, 
                                color: '#2563eb' 
                            }}>
                                {totalToilets}
                            </span>
                        </div>
                    </details>

                    <div
                        style={{
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '2px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                        }}
                    >
                        <Button
                            primary
                            onClick={handleSubmit}
                            disabled={loading}
                            large
                        >
                            {loading ? 'Submitting...' : 'Submit inspection'}
                        </Button>
                    </div>

                    {data && (
                        <AlertStack>
                            <AlertBar success duration={8000}>
                                <div>
                                    <strong>{i18n.t('Inspection submitted successfully!')}</strong>
                                    <div style={{ marginTop: 4, fontSize: 13 }}>
                                        {i18n.t('{{count}} fields saved', { count: lastSubmitted.length })}
                                    </div>
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {error && (
                        <AlertStack>
                            <AlertBar critical duration={10000}>
                                <div>
                                    <strong>{i18n.t('Error submitting inspection')}</strong>
                                    <div style={{ marginTop: 4, fontSize: 13 }}>
                                        {error.message || i18n.t('An unexpected error occurred. Please try again.')}
                                    </div>
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}
                </>
            )}
        </div>
    )
}