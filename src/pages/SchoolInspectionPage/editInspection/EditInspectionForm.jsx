import React, { useEffect, useState, useCallback, useRef } from 'react'
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

const TOTAL_CLASSROOMS_ID = 'ya5SyA5hej4'
const CLEAN_CLASSROOMS_ID = 'XIgpDhDC4Ol'
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

const FIELD_LABEL_LOOKUP = SCHOOL_INSPECTION_FIELDS.reduce((acc, field) => {
    acc[field.id] = field.label
    if (field.child_query) {
        acc[field.child_query.id] = field.child_query.label
    }
    return acc
}, {})

function NumberField({ label, value = '', onChange, error, iconNames, hasChanged = false, max, maxMessage }) {
    const [isFocused, setIsFocused] = useState(false)
    const [showMaxHint, setShowMaxHint] = useState(false)
    const hintTimeoutRef = useRef(null)
    // Treat blank/null/undefined as 0 for calculations, but preserve blank state
    const isBlank = value === '' || value === null || value === undefined
    const numericValue = isBlank ? 0 : Number(value) || 0

    const clearHintTimeout = useCallback(() => {
        if (hintTimeoutRef.current) {
            clearTimeout(hintTimeoutRef.current)
            hintTimeoutRef.current = null
        }
    }, [])

    const triggerMaxHint = useCallback(() => {
        if (max === undefined || max === null) return
        setShowMaxHint(true)
        clearHintTimeout()
        hintTimeoutRef.current = setTimeout(() => {
            setShowMaxHint(false)
            hintTimeoutRef.current = null
        }, 2200)
    }, [max, clearHintTimeout])

    useEffect(() => {
        return () => {
            clearHintTimeout()
        }
    }, [clearHintTimeout])

    const applyChange = useCallback(
        (newValue, { forceHint = false } = {}) => {
            if (
                max !== undefined &&
                max !== null &&
                newValue !== '' &&
                newValue !== null
            ) {
                const numValue = Number(newValue)
                if (!Number.isNaN(numValue) && numValue > max) {
                    onChange(String(max))
                    triggerMaxHint()
                    return
                }
            }

            onChange(newValue)

            if (forceHint) {
                triggerMaxHint()
            }
        },
        [max, onChange, triggerMaxHint]
    )

    const handleIncrement = () => {
        // if blank, go to 0 first, otherwise increment
        if (isBlank) {
            applyChange('0')
        } else {
            const nextValue = numericValue + 1
            // if max is set and next value would exceed it, cap at max
            if (max !== undefined && max !== null && nextValue > max) {
                applyChange(String(max), { forceHint: true })
            } else {
                applyChange(String(nextValue))
            }
        }
    }

    const handleDecrement = () => {
        // If blank or 0, stay at 0
        if (isBlank || numericValue === 0) {
            applyChange('')
        } else {
            applyChange(String(numericValue - 1))
        }
    }

    return (
        <div className={`${editFormStyles.numberFieldContainer} ${hasChanged ? editFormStyles.numberFieldContainerChanged : ''} ${error ? editFormStyles.numberFieldContainerError : ''}`}>
            <label className={`${editFormStyles.numberLabel} ${error ? editFormStyles.numberLabelError : ''}`}>
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
                    <span className={`${editFormStyles.badge} ${editFormStyles.badgeModified}`}>
                        <IconWarning16 />
                        Modified
                    </span>
                )}
                {error && (
                    <span className={`${editFormStyles.badge} ${editFormStyles.badgeError}`}>
                        <IconError16 />
                        {error === 'Required' ? 'Required' : error}
                    </span>
                )}
            </label>
            <div className={editFormStyles.numberInputContainer}>
                <input
                    type="number"
                    min="0"
                    max={max !== undefined && max !== null ? max : undefined}
                    value={value}
                    onChange={e => applyChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`${editFormStyles.numberInput} ${hasChanged ? editFormStyles.numberInputChanged : ''} ${error ? editFormStyles.numberInputError : ''}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${label}-error` : undefined}
                />
                <Button
                    onClick={handleDecrement}
                    disabled={isBlank && numericValue === 0}
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
                    className={editFormStyles.numberError}
                    role="alert"
                >
                    <IconError16 />
                    <span>{error}</span>
                </p>
            )}
            {max !== undefined && max !== null && showMaxHint && (
                <div className={editFormStyles.maxHintBubble}>
                    {maxMessage || `Cannot exceed ${max}`}
                </div>
            )}
        </div>
    )
}

export default function EditInspectionForm( {event, orgUnitId, orgUnitName, onDeleted,}) {
    const [formState, setFormState] = useState({})
    const [originalFormState, setOriginalFormState] = useState({}) // Store original values for change detection
    const [errors, setErrors] = useState({})
    const [updateResult, setUpdateResult] = useState(null)
    const [deleteResult, setDeleteResult] = useState(null)
    const [lastSavedCount, setLastSavedCount] = useState(null)

    // when an event is updated, clear previous results
    const [missingRequiredLabels, setMissingRequiredLabels] = useState([])
    const [showMissingPopup, setShowMissingPopup] = useState(false)

    const [updateEvent, { loading: saving, error: saveError, data: saveData }] =
        useUpdateSchoolInspectionEvent()
    const [deleteEvent, { loading: deleting, error: deleteError }] =
        useDeleteSchoolInspectionEvent()

    // when event prop changes, load its data into formState
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
                // for numeric fields, normalize to string format for consistency
                if (raw === undefined || raw === null || raw === '') {
                    next[field.id] = ''
                } else {
                    const num = Number(raw)
                    // if its a valid number, store as string to match how handleChange stores it
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
                    // normalize child values too (condition ratings are numbers)
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
        setUpdateResult(null)
        setDeleteResult(null)
        setLastSavedCount(null)
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

    const isEmptyValue = useCallback(
        value => value === undefined || value === null || value === '',
        []
    )

    const clearFieldError = useCallback(
        (fieldId, value, { forceClearError = false } = {}) => {
            const shouldClear = forceClearError || !isEmptyValue(value)

            if (!shouldClear) {
                return
            }

            setErrors(prev => {
                if (!prev[fieldId]) return prev
                const next = { ...prev }
                delete next[fieldId]
                return next
            })

            setMissingRequiredLabels(prev => {
                if (prev.length === 0) return prev
                const label = FIELD_LABEL_LOOKUP[fieldId]
                if (!label) return prev
                const filtered = prev.filter(item => item !== label)
                return filtered.length === prev.length ? prev : filtered
            })
        },
        [isEmptyValue]
    )

    const handleChange = useCallback((id, value, options = {}) => {
        // Normalize the value
        let newValue = normalizeChange(id, value)
        

        // if its a number or numeric string, store as string
        const field = SCHOOL_INSPECTION_FIELDS.find(f => f.id === id)
        if (field && field.type !== 'BOOLEAN') {
            const num = Number(newValue)
            if (!Number.isNaN(num) && newValue !== '' && newValue !== null) {
                newValue = String(num) // store as string
            } else if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = '' // consistent empty value
            }
        }
        let cappedCleanValue
        setFormState(prev => {
            const updated = { ...prev, [id]: newValue }

            // if total classrooms is being changed, check if clean classrooms needs to be capped
            if (id === TOTAL_CLASSROOMS_ID) {
                const isBlank =
                    newValue === undefined || newValue === null || newValue === ''
                if (!isBlank) {
                    const totalRooms = Number(newValue)
                    if (!Number.isNaN(totalRooms)) {
                        const cleanRaw = prev[CLEAN_CLASSROOMS_ID]
                        const hasCleanValue =
                            cleanRaw !== undefined &&
                            cleanRaw !== null &&
                            cleanRaw !== ''
                        if (hasCleanValue) {
                            const cleanRooms = Number(cleanRaw)
                            if (
                                !Number.isNaN(cleanRooms) &&
                                cleanRooms > totalRooms
                            ) {
                                const nextValue = String(totalRooms)
                                updated[CLEAN_CLASSROOMS_ID] = nextValue
                                cappedCleanValue = nextValue
                            }
                        }
                    }
                }
            }

            return updated
        })

        clearFieldError(id, newValue, options)
        if (cappedCleanValue !== undefined) {
            clearFieldError(CLEAN_CLASSROOMS_ID, cappedCleanValue, {
                forceClearError: true,
            })
        }
    }, [clearFieldError])

    const totalToilets = computeTotalToilets(formState)

    const validateForm = () => {
        // start with existing validation
        const newErrors = validateSchoolInspection(formState) || {}
        const isEmpty = v => v === undefined || v === null || v === ''

        // add required field checks
        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            const id = field.id

            // skip total toilets that is being auto calculated
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

        // build missing labels list
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

        // override total toilets with computed value
        dataValuesArray.push({
            dataElement: TOTAL_TOILETS_ID,
            value: totalToilets,
        })

        const occurredAt = event?.eventdate
            ? new Date(event.eventdate).toISOString()
            : new Date().toISOString()

        const status = event?.eventstatus || 'COMPLETED'

        const result = await updateEvent({
            eventId,
            orgUnit: effectiveOrgUnit,
            occurredAt,
            status,
            programId: PROGRAM_ID,
            programStageId: STAGE_ID,
            dataValues: dataValuesArray,
        })

        // store result for display
        setUpdateResult(result)
        // store count for success message
        if (result?.isOnline !== false) {
            setLastSavedCount(dataValuesArray.length)
        } else {
            setLastSavedCount(null)
        }
    }

    const handleReset = () => {
        if (
            !window.confirm(
                i18n.t('Are you sure you want to reset all changes? All unsaved modifications will be lost.')
            )
        ) {
            return
        }

        // reset formState to originalFormState
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

        const result = await deleteEvent({ eventId })
        // store result for display
        setDeleteResult(result)
        // only proceed with deletion callback if online
        if (result?.isOnline !== false && onDeleted) {
            onDeleted(eventId)
        }
    }

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    // helper function to normalize a value for comparison
    const normalizeForComparison = (value) => {
        // handle null, undefined, empty string as null
        if (value === null || value === undefined || value === '') {
            return null
        }
        
        // for booleans, normalize to true/false/null
        if (value === true || value === 'true' || value === 1) return true
        if (value === false || value === 'false' || value === 0) return false
        
        // try to convert to number first
        const num = Number(value)
        if (!Number.isNaN(num) && value !== '') {
            return num
        }

        return String(value).trim()
    }

    // Helper function to check if a field has changed from original
    const hasFieldChanged = (fieldId) => {
        const current = formState[fieldId]
        const original = originalFormState[fieldId]
        
        // if theyre exactly equal, no change
        if (current === original) return false
        
        // normalize both values for comparison
        const currentNormalized = normalizeForComparison(current)
        const originalNormalized = normalizeForComparison(original)
        
        // use strict equality for comparison
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

        if (type === 'BOOLEAN' && hasChild) {
            return (
                <div key={id} className={editFormStyles.fieldWrapper}>
                    <div className={editFormStyles.fieldWrapperFlex}>
                        <div className={`${editFormStyles.fieldWrapperFlexItem} ${hasFieldChanged(id) ? editFormStyles.fieldWrapperFlexItemChanged : ''} ${errors[id] ? editFormStyles.fieldWrapperFlexItemError : ''}`}>
                            <BooleanChoiceField
                                label={label}
                                value={value}
                                onChange={v => {
                                    handleChange(id, v)
                                    // Clear condition rating if unselected or set to false
                                    if (v === null || v === false) {
                                        handleChange(childId, null, {
                                            forceClearError: true,
                                        })
                                    }
                                }}
                                error={errors[id]}
                                trueLabel="Available"
                                falseLabel="Not available"
                                hasChanged={hasFieldChanged(id)}
                            />
                        </div>
                        <div className={`${editFormStyles.fieldWrapperFlexItemWide} ${hasFieldChanged(childId) ? editFormStyles.fieldWrapperFlexItemWideChanged : ''} ${errors[childId] ? editFormStyles.fieldWrapperFlexItemWideError : ''}`}>
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

        // plain boolean field
        if (type === 'BOOLEAN') {
            return (
                <div key={id} className={`${editFormStyles.fieldWrapper} ${hasFieldChanged(id) ? editFormStyles.fieldWrapperChanged : ''} ${errors[id] ? editFormStyles.fieldWrapperError : ''}`}>
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

        // numeric field
        const numericValue = formState[id] ?? ''
        let maxValue
        let maxHintMessage
        if (id === CLEAN_CLASSROOMS_ID) {
            const totalRaw = formState[TOTAL_CLASSROOMS_ID]
            const hasTotalValue =
                totalRaw !== undefined &&
                totalRaw !== null &&
                totalRaw !== ''
            if (hasTotalValue) {
                const parsedTotal = Number(totalRaw)
                if (!Number.isNaN(parsedTotal)) {
                    maxValue = parsedTotal
                    maxHintMessage = `Cannot exceed total classrooms (${parsedTotal})`
                }
            }
        }

        return (
            <NumberField
                key={id}
                label={label}
                value={numericValue}
                onChange={val => handleChange(id, val)}
                error={errors[id]}
                iconNames={FIELD_ICONS[id]}
                hasChanged={hasFieldChanged(id)}
                max={maxValue}
                maxMessage={maxHintMessage}
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
        <div className={editFormStyles.formContainer}>
            {/* Validation error notification at bottom */}
            {showMissingPopup && missingRequiredLabels.length > 0 && (
                <div className={editFormStyles.popupOverlay}>
                    <div className={editFormStyles.popup}>
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowMissingPopup(false)}
                            className={editFormStyles.popupCloseButton}
                            aria-label={i18n.t('Close')}
                        >
                            <IconCross16 />
                        </button>

                        <div className={editFormStyles.popupContent}>
                            <div className={editFormStyles.popupHeader}>
                                <div className={editFormStyles.popupIcon}>
                                    <IconWarning16 />
                                </div>
                                <div className={editFormStyles.popupText}>
                                    <strong className={editFormStyles.popupTitle}>
                                        {i18n.t('Please complete all required fields')}
                                    </strong>
                                    <div className={editFormStyles.popupDescription}>
                                        {i18n.t('The following {{count}} field(s) need to be filled before saving:', { count: missingRequiredLabels.length })}
                                    </div>
                                    <ul className={editFormStyles.popupList}>
                                        {missingRequiredLabels.map(label => (
                                            <li key={label} className={editFormStyles.popupListItem}>
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
            <div className={editFormStyles.header}>
                <div>
                    <h3 className={editFormStyles.headerTitle}>
                        Edit inspection – {orgUnitName || effectiveOrgUnit}
                    </h3>
                    <p className={editFormStyles.headerSubtitle}>
                        <strong>Date:</strong> {inspectionDateLabel}
                    </p>
                    <p className={editFormStyles.headerSubtext}>
                        <strong>Event ID:</strong> {eventId}
                    </p>
                </div>

                <div className={editFormStyles.headerStats}>
                    {`${filledCount} of ${totalCount} fields completed`}
                </div>
            </div>

            {/* progress bar */}
            <div className={editFormStyles.progressSection}>
                <div className={editFormStyles.progressBar}>
                    <div
                        className={`${editFormStyles.progressBarFill} ${progressPct === 100 ? editFormStyles.progressBarFillComplete : ''}`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className={editFormStyles.progressStats}>
                    <span>Progress: {filledCount} of {totalCount} fields</span>
                    <span className={`${editFormStyles.progressPercentage} ${progressPct === 100 ? editFormStyles.progressPercentageComplete : ''}`}>
                        {Math.round(progressPct)}%
                    </span>
                </div>
            </div>

            {isBusy && (
                <div className={editFormStyles.loadingIndicator}>
                    <CircularLoader small />
                    <span className={editFormStyles.loadingText}>
                        {saving ? i18n.t('Saving changes...') : i18n.t('Deleting inspection...')}
                    </span>
                </div>
            )}

            {!isBusy && (
                <>
                    {/* Facilities */}
                    <details open className={editFormStyles.sectionBox}>
                        <summary className={editFormStyles.sectionSummary}>
                            Facilities
                        </summary>
                        <p className={editFormStyles.sectionDescription}>
                            Edit which facilities are available and adjust
                            their condition if needed.
                        </p>
                        <div className={editFormStyles.facilitiesContainer}>
                            {facilities.map(renderField)}
                        </div>
                    </details>

                    {/* Capacity */}
                    <details open className={editFormStyles.sectionBox}>
                        <summary className={editFormStyles.sectionSummary}>
                            Capacity
                        </summary>
                        <p className={editFormStyles.sectionDescription}>
                            Update numbers for classrooms, learners, seats and
                            teachers.
                        </p>

                        <div className={`${editFormStyles.sectionGrid} ${editFormStyles.capacityGrid}`}>
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    {/* Sanitation and staffing */}
                    <details open className={editFormStyles.sectionBox}>
                        <summary className={editFormStyles.sectionSummary}>
                            Sanitation & staffing
                        </summary>
                        <p className={editFormStyles.sectionDescription}>
                            Adjust toilets per group. Total toilets is
                            recalculated automatically.
                        </p>

                        <div className={`${editFormStyles.sectionGrid} ${editFormStyles.sanitationGrid}`}>
                            {sanitation.map(renderField)}
                        </div>

                        <div className={editFormStyles.totalToiletsBox}>
                            <strong className={editFormStyles.totalToiletsLabel}>
                                Total toilets: 
                            </strong>
                            <span className={editFormStyles.totalToiletsValue}>
                                {totalToilets}
                            </span>
                        </div>
                    </details>

                    {/* Sticky actions */}
                    <div className={editFormStyles.actionsContainer}>
                        <div className={editFormStyles.actionsButtons}>
                            <div className={editFormStyles.actionsButtonsInner}>
                                <Button
                                    onClick={handleReset}
                                    disabled={saving || deleting}
                                    large
                                >
                                    <span className={editFormStyles.buttonTextFull}>{i18n.t('Reset changes')}</span>
                                    <span className={editFormStyles.buttonTextShort}>Reset</span>
                                </Button>
                                <Button
                                    primary
                                    onClick={handleSave}
                                    disabled={saving || deleting}
                                    large
                                    style={{ minWidth: 140 }}
                                >
                                    <span className={editFormStyles.buttonTextFull}>{saving ? 'Saving…' : 'Save changes'}</span>
                                    <span className={editFormStyles.buttonTextShort}>{saving ? 'Saving…' : 'Save'}</span>
                                </Button>
                                <Button
                                    destructive
                                    onClick={handleDelete}
                                    disabled={saving || deleting}
                                    large
                                >
                                    <span className={editFormStyles.buttonTextFull}>{deleting ? 'Deleting…' : i18n.t('Delete form')}</span>
                                    <span className={editFormStyles.buttonTextShort}>{deleting ? 'Deleting…' : 'Delete'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {(saveData || updateResult) && (
                        <AlertStack>
                            <AlertBar 
                                success={updateResult?.isOnline !== false && saveData} 
                                warning={updateResult?.isOnline === false}
                                duration={8000}
                            >
                                <div>
                                    {updateResult?.isOnline === false ? (
                                        <>
                                            <strong>{i18n.t('You are offline')}</strong>
                                            <div className={editFormStyles.alertMessage}>
                                                {updateResult?.message || i18n.t('You are offline. Your request has been stored, and will be posted when back online. No comparison available')}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <strong>{i18n.t('Changes saved successfully!')}</strong>
                                            <div className={editFormStyles.alertMessage}>
                                                {i18n.t('Updated {{count}} field(s)', { count: lastSavedCount || 0 })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {saveError && (
                        <AlertStack>
                            <AlertBar critical duration={10000}>
                                <div>
                                    <strong>{i18n.t('Error saving changes')}</strong>
                                    <div className={editFormStyles.alertMessage}>
                                        {saveError.message ||
                                            i18n.t('An unexpected error occurred. Please try again.')}
                                    </div>
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {deleteResult && deleteResult?.isOnline === false && (
                        <AlertStack>
                            <AlertBar warning duration={8000}>
                                <div>
                                    <strong>{i18n.t('Cannot delete when offline')}</strong>
                                    <div className={editFormStyles.alertMessage}>
                                        {deleteResult?.message || i18n.t('Cannot delete when offline. Try again later')}
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
                                    <div className={editFormStyles.alertMessage}>
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