// pages/SchoolInspectionPage/editInspection/EditInspectionForm.jsx
import React, { useEffect, useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    CircularLoader,
    NoticeBox,
    AlertStack,
    AlertBar,
    IconSubtract16,
    IconAdd16,
    IconWarning16,
    IconError16,
    IconCross16,
} from '@dhis2/ui'
import { useUpdateSchoolInspectionEvent } from './hooks/useUpdateSchoolInspection'
import { useDeleteSchoolInspectionEvent } from './hooks/useDeleteSchoolInspection'

import {
    SCHOOL_INSPECTION_FIELDS,
    FACILITY_IDS,
    CAPACITY_IDS,
    SANITATION_IDS,
    TOTAL_TOILETS_ID,
} from '../newInspection/configs/schoolInspectionConfig'
import {
    computeTotalToilets,
    validateSchoolInspection,
    computeProgress,
    normalizeChange,
} from '../newInspection/configs/inspectionFormUtils'

import BooleanChoiceField from '../newInspection/components/BooleanChoiceField'
import ConditionRatingField from '../newInspection/components/ConditionRatingField'
import Icon, { CombinedIcon } from '../../../shared/ui/icons/Icon'
import { FIELD_ICONS } from '../newInspection/configs/fieldIcons'
import editFormStyles from './EditInspectionForm.module.css'

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID = 'eJiBjm9Rl7E'

// shared styles with inspection

const sectionBoxStyle = {
    background: '#ffffff',
    padding: 20,
    borderRadius: 12,
    border: '2px solid #e5e7eb',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
}

// Single column grid - one field per line
const sectionGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    rowGap: 20,
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    maxWidth: 500, // Natural width limit
}

const numberFieldContainerStyle = {
    marginBottom: 0, // Grid handles spacing
    width: '100%',
    maxWidth: '100%',
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
    padding: '14px 16px', // Larger padding
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

function NumberField({ label, value = '', onChange, error, iconNames, hasChanged = false }) {
    const [isFocused, setIsFocused] = React.useState(false)
    const numericValue = value === '' || value === null || value === undefined ? 0 : Number(value) || 0

    const handleIncrement = () => {
        onChange(String(numericValue + 1))
    }

    const handleDecrement = () => {
        if (numericValue > 0) {
            onChange(String(numericValue - 1))
        }
    }

    return (
        <div style={{
            ...numberFieldContainerStyle,
            ...(hasChanged && {
                padding: '12px',
                borderRadius: 8,
                background: '#fef3c7',
                border: '2px solid #fbbf24',
            }),
            ...(error && {
                padding: '12px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '2px solid #f87171',
            }),
        }}>
            <label style={{
                ...numberLabelStyle,
                ...(error && { color: '#b91c1c' }),
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                {iconNames && iconNames.length > 0 && (
                    <CombinedIcon 
                        icons={iconNames} 
                        size={24} 
                        gap={6}
                        style={{ color: error ? '#b91c1c' : '#2563eb' }}
                    />
                )}
                <span>{label}</span>
                {hasChanged && (
                    <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#d97706',
                        background: '#fef3c7',
                        padding: '2px 6px',
                        borderRadius: 4,
                        marginLeft: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                    }}>
                        <IconWarning16 />
                        Modified
                    </span>
                )}
                {error && (
                    <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#b91c1c',
                        background: '#fee2e2',
                        padding: '2px 6px',
                        borderRadius: 4,
                        marginLeft: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                    }}>
                        <IconError16 />
                        Required
                    </span>
                )}
            </label>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        ...(isFocused ? numberInputFocusStyle : numberInputStyle),
                        ...(hasChanged && {
                            borderColor: '#fbbf24',
                            background: '#ffffff',
                        }),
                        ...(error && {
                            borderColor: '#f87171',
                            background: '#ffffff',
                        }),
                        flex: 1,
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${label}-error` : undefined}
                />
                <Button
                    onClick={handleDecrement}
                    disabled={numericValue <= 0}
                    icon={<IconSubtract16 />}
                    small
                    aria-label={`Decrease ${label}`}
                />
                <Button
                    onClick={handleIncrement}
                    icon={<IconAdd16 />}
                    small
                    aria-label={`Increase ${label}`}
                />
            </div>
            {error && (
                <p
                    id={`${label}-error`}
                    style={{
                        marginTop: 8,
                        marginBottom: 0,
                        fontSize: 12,
                        color: '#b91c1c',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                    role="alert"
                >
                    <IconError16 />
                    <span>{error}</span>
                </p>
            )}
        </div>
    )
}

export default function EditInspectionForm({
                                               event,
                                               orgUnitId,
                                               orgUnitName,
                                               onDeleted,
                                           }) {
    const [formState, setFormState] = useState({})
    const [originalFormState, setOriginalFormState] = useState({}) // Store original values for change detection
    const [errors, setErrors] = useState({})
    const [lastSaved, setLastSaved] = useState(null)

    // ny state for popup + liste over manglende felter
    const [missingRequiredLabels, setMissingRequiredLabels] = useState([])
    const [showMissingPopup, setShowMissingPopup] = useState(false)

    const [updateEvent, { loading: saving, error: saveError }] =
        useUpdateSchoolInspectionEvent()
    const [deleteEvent, { loading: deleting, error: deleteError }] =
        useDeleteSchoolInspectionEvent()

    // Når valgt event endres, populer formState
    useEffect(() => {
        if (!event) return

        const next = {}

        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            const raw = event[field.id]

            if (field.type === 'BOOLEAN') {
                if (raw === undefined || raw === null || raw === '') {
                    next[field.id] = null
                } else if (raw === true || raw === 'true') {
                    next[field.id] = true
                } else if (raw === false || raw === 'false') {
                    next[field.id] = false
                } else {
                    const n = Number(raw)
                    next[field.id] = !Number.isNaN(n) ? n > 0 : null
                }
            } else {
                // For numeric fields, normalize to string format for consistency
                if (raw === undefined || raw === null || raw === '') {
                    next[field.id] = ''
                } else {
                    const num = Number(raw)
                    // If it's a valid number, store as string to match how handleChange stores it
                    if (!Number.isNaN(num)) {
                        next[field.id] = String(num)
                    } else {
                        next[field.id] = String(raw)
                    }
                }
            }

            if (field.child_query) {
                const childRaw = event[field.child_query.id]
                if (
                    childRaw !== undefined &&
                    childRaw !== null &&
                    childRaw !== ''
                ) {
                    // Normalize child values too (condition ratings are numbers)
                    const childNum = Number(childRaw)
                    if (!Number.isNaN(childNum)) {
                        next[field.child_query.id] = String(childNum)
                    } else {
                        next[field.child_query.id] = String(childRaw)
                    }
                } else {
                    next[field.child_query.id] = ''
                }
            }
        })

        setFormState(next)
        setOriginalFormState({ ...next }) // Store original values for comparison
        setErrors({})
        setLastSaved(null)
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
    }, [event])

    if (!event) {
        return (
            <NoticeBox title="Select an event">
                Pick an event in the table above to edit or delete.
            </NoticeBox>
        )
    }

    const eventId = event?.psi || event?.event
    const effectiveOrgUnit = orgUnitId ?? event?.ou ?? event?.orgUnit
    const inspectionDateLabel = event?.eventdate
        ? new Date(event.eventdate).toLocaleDateString()
        : 'Not set'

    const handleChange = (id, value) => {
        // Normalize the value using the same logic as when loading
        let newValue = normalizeChange(id, value)
        
        // For numeric fields, ensure consistent storage format
        // If it's a number or numeric string, store as string (matching how originals are stored)
        const field = SCHOOL_INSPECTION_FIELDS.find(f => f.id === id)
        if (field && field.type !== 'BOOLEAN') {
            const num = Number(newValue)
            if (!Number.isNaN(num) && newValue !== '' && newValue !== null) {
                newValue = String(num) // Store as string to match original format
            } else if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = '' // Consistent empty value
            }
        }
        
        setFormState(prev => ({
            ...prev,
            [id]: newValue,
        }))
    }

    const totalToilets = computeTotalToilets(formState)

    const validateForm = () => {
        // start med domenespesifikk validering (f.eks. range checks)
        const newErrors = validateSchoolInspection(formState) || {}
        const isEmpty = v => v === undefined || v === null || v === ''

        // legg på "Required" for tomme felter (bortsett fra total toilets)
        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            const id = field.id

            // ikke krev total toilets, den er auto-beregnet
            if (id === TOTAL_TOILETS_ID) return

            if (field.type === 'BOOLEAN') {
                const value = formState[id]
                if (isEmpty(value) && !newErrors[id]) {
                    newErrors[id] = 'Required'
                }

                if (field.child_query) {
                    const childId = field.child_query.id
                    const childValue = formState[childId]
                    const isTrue = value === true || value === 'true'

                    if (
                        isTrue &&
                        isEmpty(childValue) &&
                        !newErrors[childId]
                    ) {
                        newErrors[childId] = 'Required'
                    }
                }
            } else {
                const value = formState[id]
                if (isEmpty(value) && !newErrors[id]) {
                    newErrors[id] = 'Required'
                }
            }
        })

        setErrors(newErrors)

        // bygg liste med labels til popup
        const missingLabels = []
        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            if (field.id === TOTAL_TOILETS_ID) return

            if (newErrors[field.id] === 'Required') {
                missingLabels.push(field.label)
            }
            if (
                field.child_query &&
                newErrors[field.child_query.id] === 'Required'
            ) {
                missingLabels.push(field.child_query.label)
            }
        })
        setMissingRequiredLabels(missingLabels)

        const ok = Object.keys(newErrors).length === 0
        return ok
    }

    const handleSave = async () => {
        if (!eventId) {
            alert('Missing eventId for update')
            return
        }
        if (!effectiveOrgUnit) {
            alert('Missing orgUnitId for update')
            return
        }

        const ok = validateForm()
        if (!ok) {
            setShowMissingPopup(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        const dataValuesArray = SCHOOL_INSPECTION_FIELDS.reduce(
            (acc, field) => {
                const parentId = field.id
                const parentValue = formState[parentId]

                // ikke send total-toilets her, vi overstyrer senere
                if (parentId === TOTAL_TOILETS_ID) {
                    return acc
                }

                if (
                    parentValue === undefined ||
                    parentValue === null
                ) {
                    return acc
                }

                if (field.type === 'BOOLEAN') {
                    acc.push({
                        dataElement: parentId,
                        value: !!parentValue,
                    })
                } else {
                    acc.push({
                        dataElement: parentId,
                        value: parentValue,
                    })
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
                        acc.push({
                            dataElement: childId,
                            value: childValue,
                        })
                    }
                }

                return acc
            },
            []
        )

        // Overstyr total toilets (auto-beregnet)
        dataValuesArray.push({
            dataElement: TOTAL_TOILETS_ID,
            value: totalToilets,
        })

        const occurredAt = event?.eventdate
            ? new Date(event.eventdate).toISOString()
            : new Date().toISOString()

        const status = event?.eventstatus || 'COMPLETED'

        await updateEvent({
            eventId,
            orgUnit: effectiveOrgUnit,
            occurredAt,
            status,
            programId: PROGRAM_ID,
            programStageId: STAGE_ID,
            dataValues: dataValuesArray,
        })

        setLastSaved(dataValuesArray.length)
        // Success feedback is shown via AlertBar, no need for alert
    }

    const handleReset = () => {
        if (
            !window.confirm(
                i18n.t('Are you sure you want to reset all changes? All unsaved modifications will be lost.')
            )
        ) {
            return
        }

        // Reset formState to originalFormState
        setFormState({ ...originalFormState })
        setErrors({})
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
    }

    const handleDelete = async () => {
        if (!eventId) {
            alert('Missing eventId for delete')
            return
        }
        if (
            !window.confirm(
                `Delete event ${eventId}? This cannot be undone.`
            )
        )
            return

        await deleteEvent({ eventId })
        // Success feedback handled by parent component or navigation
        if (onDeleted) onDeleted(eventId)
    }

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    // Helper function to normalize a value for comparison
    const normalizeForComparison = (value) => {
        // Handle null, undefined, empty string as null
        if (value === null || value === undefined || value === '') {
            return null
        }
        
        // For booleans, normalize to true/false/null
        if (value === true || value === 'true' || value === 1) return true
        if (value === false || value === 'false' || value === 0) return false
        
        // Try to convert to number first
        const num = Number(value)
        if (!Number.isNaN(num) && value !== '') {
            // If it's a valid number, return it as a number for comparison
            // This handles "5" vs 5 vs "5.0" all as the same
            return num
        }
        
        // Otherwise return as trimmed string
        return String(value).trim()
    }

    // Helper function to check if a field has changed from original
    const hasFieldChanged = (fieldId) => {
        const current = formState[fieldId]
        const original = originalFormState[fieldId]
        
        // Quick check: if they're exactly equal, no change
        if (current === original) return false
        
        // Normalize both values for comparison
        const currentNormalized = normalizeForComparison(current)
        const originalNormalized = normalizeForComparison(original)
        
        // Use strict equality for comparison
        return currentNormalized !== originalNormalized
    }

    const renderField = ({ id, label, type, child_query }) => {
        const value = formState[id]
        const hasChild = !!child_query

        const childId = child_query?.id
        const childValue = childId ? formState[childId] : null
        const numericChildValue =
            childValue !== undefined &&
            childValue !== null &&
            childValue !== ''
                ? Number(childValue)
                : null

        const isTrue = value === true || value === 'true'

        // BOOLEAN + condition-rating
        if (type === 'BOOLEAN' && hasChild) {
            return (
                <div key={id} style={{ marginBottom: '1.5rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                        }}
                    >
                        <div style={{ 
                            flex: '1 1 auto', 
                            minWidth: '200px', 
                            maxWidth: '300px',
                            ...(hasFieldChanged(id) && {
                                padding: '12px',
                                borderRadius: 8,
                                background: '#fef3c7',
                                border: '2px solid #fbbf24',
                            }),
                            ...(errors[id] && {
                                padding: '12px',
                                borderRadius: 8,
                                background: '#fef2f2',
                                border: '2px solid #f87171',
                            }),
                        }}>
                            <BooleanChoiceField
                                label={label}
                                value={value}
                                onChange={v => {
                                    handleChange(id, v)
                                    // Clear condition rating if unselected (null) or set to false
                                    if (v === null || v === false) {
                                        handleChange(childId, null)
                                    }
                                }}
                                error={errors[id]}
                                trueLabel="Available"
                                falseLabel="Not available"
                                hasChanged={hasFieldChanged(id)}
                            />
                        </div>
                        <div style={{ 
                            flex: '1 1 auto', 
                            minWidth: '200px',
                            ...(hasFieldChanged(childId) && {
                                padding: '12px',
                                borderRadius: 8,
                                background: '#fef3c7',
                                border: '2px solid #fbbf24',
                            }),
                            ...(errors[childId] && {
                                padding: '12px',
                                borderRadius: 8,
                                background: '#fef2f2',
                                border: '2px solid #f87171',
                            }),
                        }}>
                            <ConditionRatingField
                                label={child_query.label}
                                value={numericChildValue}
                                onChange={num =>
                                    handleChange(childId, num)
                                }
                                disabled={!isTrue}
                                error={errors[childId]}
                                hasChanged={hasFieldChanged(childId)}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        // Ren BOOLEAN
        if (type === 'BOOLEAN') {
            return (
                <div key={id} style={{
                    marginBottom: '1.5rem',
                    ...(hasFieldChanged(id) && {
                        padding: '12px',
                        borderRadius: 8,
                        background: '#fef3c7',
                        border: '2px solid #fbbf24',
                    }),
                    ...(errors[id] && {
                        padding: '12px',
                        borderRadius: 8,
                        background: '#fef2f2',
                        border: '2px solid #f87171',
                    }),
                }}>
                    <BooleanChoiceField
                        label={label}
                        value={value}
                        onChange={v => handleChange(id, v)}
                        error={errors[id]}
                        hasChanged={hasFieldChanged(id)}
                    />
                </div>
            )
        }

        // Numeric field
        const numericValue = formState[id] ?? ''
        return (
            <NumberField
                key={id}
                label={label}
                value={numericValue}
                onChange={val => handleChange(id, val)}
                error={errors[id]}
                iconNames={FIELD_ICONS[id]}
                hasChanged={hasFieldChanged(id)}
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

    const isBusy = saving || deleting

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
            {/* Validation error notification at bottom */}
            {showMissingPopup && missingRequiredLabels.length > 0 && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 16,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        padding: '0 16px',
                        display: 'flex',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            background: '#fef3c7',
                            border: '3px solid #f59e0b',
                            borderRadius: 12,
                            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3), 0 0 0 1px rgba(217, 119, 6, 0.1)',
                            maxWidth: 600,
                            width: '100%',
                            maxHeight: '60vh',
                            overflow: 'auto',
                            position: 'relative',
                            pointerEvents: 'auto',
                        }}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowMissingPopup(false)}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: 'none',
                                background: '#f1f5f9',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e2e8f0'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f1f5f9'
                            }}
                            aria-label={i18n.t('Close')}
                        >
                            <IconCross16 />
                        </button>

                        <div style={{
                            padding: '20px 48px 24px 24px',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                            }}>
                                <div style={{
                                    flexShrink: 0,
                                    marginTop: 2,
                                }}>
                                    <IconWarning16 />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ 
                                        display: 'block', 
                                        marginBottom: 10,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: '#92400e',
                                    }}>
                                        {i18n.t('Please complete all required fields')}
                                    </strong>
                                    <div style={{ 
                                        fontSize: 13,
                                        color: '#78350f',
                                        marginBottom: 12,
                                        lineHeight: 1.5,
                                    }}>
                                        {i18n.t('The following {{count}} field(s) need to be filled before saving:', { count: missingRequiredLabels.length })}
                                    </div>
                                    <ul
                                        style={{
                                            margin: 0,
                                            padding: 0,
                                            paddingLeft: 20,
                                            fontSize: 13,
                                            color: '#78350f',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {missingRequiredLabels.map(label => (
                                            <li key={label} style={{ marginBottom: 6 }}>
                                                {label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 8,
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <h3 style={{ margin: 0 }}>
                        Edit inspection – {orgUnitName || effectiveOrgUnit}
                    </h3>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            color: '#64748b',
                        }}
                    >
                        <strong>Date:</strong> {inspectionDateLabel}
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 11,
                            color: '#94a3b8',
                        }}
                    >
                        <strong>Event ID:</strong> {eventId}
                    </p>
                </div>

                <div
                    style={{ fontSize: 12, color: '#64748b' }}
                >{`${filledCount} of ${totalCount} fields completed`}</div>
            </div>

            {/* progress bar */}
            <div style={{ marginBottom: 24 }}>
                <div
                    style={{
                        height: 8,
                        borderRadius: 999,
                        background: '#e5e7eb',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            borderRadius: 999,
                            transition: 'width 0.3s ease',
                            background:
                                progressPct === 100
                                    ? '#16a34a'
                                    : '#2563eb',
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

            {isBusy && (
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
                        {saving ? i18n.t('Saving changes...') : i18n.t('Deleting inspection...')}
                    </span>
                </div>
            )}

            {!isBusy && (
                <>
                    {/* Facilities */}
                    <details open style={sectionBoxStyle}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                color: '#0f172a',
                                listStyle: 'none',
                                outline: 'none',
                                marginBottom: 12,
                                padding: '4px 0',
                            }}
                        >
                            Facilities
                        </summary>
                        <p
                            style={{
                                marginBottom: 16,
                                fontSize: 13,
                                color: '#64748b',
                                lineHeight: 1.5,
                            }}
                        >
                            Edit which facilities are available and adjust
                            their condition if needed.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {facilities.map(renderField)}
                        </div>
                    </details>

                    {/* Capacity */}
                    <details open style={sectionBoxStyle}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                color: '#0f172a',
                                listStyle: 'none',
                                outline: 'none',
                                marginBottom: 12,
                                padding: '4px 0',
                            }}
                        >
                            Capacity
                        </summary>
                        <p
                            style={{
                                marginBottom: 16,
                                fontSize: 13,
                                color: '#64748b',
                                lineHeight: 1.5,
                            }}
                        >
                            Update numbers for classrooms, learners, seats and
                            teachers.
                        </p>

                        <div 
                            style={sectionGridStyle}
                            className={editFormStyles.capacityGrid}
                        >
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    {/* Sanitation & staffing */}
                    <details open style={sectionBoxStyle}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                color: '#0f172a',
                                listStyle: 'none',
                                outline: 'none',
                                marginBottom: 12,
                                padding: '4px 0',
                            }}
                        >
                            Sanitation & staffing
                        </summary>
                        <p
                            style={{
                                marginBottom: 16,
                                fontSize: 13,
                                color: '#64748b',
                                lineHeight: 1.5,
                            }}
                        >
                            Adjust toilets per group. Total toilets is
                            recalculated automatically.
                        </p>

                        <div 
                            style={sectionGridStyle}
                            className={editFormStyles.sanitationGrid}
                        >
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

                    {/* Sticky actions */}
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
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    onClick={handleReset}
                                    disabled={saving || deleting}
                                    large
                                >
                                    {i18n.t('Reset changes')}
                                </Button>
                                <Button
                                    primary
                                    onClick={handleSave}
                                    disabled={saving || deleting}
                                    large
                                    style={{ minWidth: 140 }}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                                <Button
                                    destructive
                                    onClick={handleDelete}
                                    disabled={saving || deleting}
                                    large
                                >
                                    {deleting ? 'Deleting…' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {lastSaved && (
                        <AlertStack>
                            <AlertBar success duration={8000}>
                                <div>
                                    <strong>{i18n.t('Changes saved successfully!')}</strong>
                                    <div style={{ marginTop: 4, fontSize: 13 }}>
                                        {i18n.t('Updated {{count}} field(s)', { count: lastSaved })}
                                    </div>
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {saveError && (
                        <AlertStack>
                            <AlertBar critical duration={10000}>
                                <div>
                                    <strong>{i18n.t('Error saving changes')}</strong>
                                    <div style={{ marginTop: 4, fontSize: 13 }}>
                                        {saveError.message ||
                                            i18n.t('An unexpected error occurred. Please try again.')}
                                    </div>
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {deleteError && (
                        <AlertStack>
                            <AlertBar critical duration={10000}>
                                <div>
                                    <strong>{i18n.t('Error deleting inspection')}</strong>
                                    <div style={{ marginTop: 4, fontSize: 13 }}>
                                        {deleteError.message ||
                                            i18n.t('An unexpected error occurred. Please try again.')}
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