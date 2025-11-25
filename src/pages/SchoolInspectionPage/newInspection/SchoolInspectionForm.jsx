// pages/SchoolInspectionPage/newInspection/SchoolInspectionForm.jsx

import React, { useContext, useEffect, useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    CircularLoader,
    AlertStack,
    AlertBar,
    IconSubtract16,
    IconAdd16,
    IconWarning16,
    IconError16,
    IconCross16,
} from '@dhis2/ui'
import usePostSchoolInspectionEvent from './hooks/usePostSchoolInspectionEvent'
import InspectionContext from '../../../context/InspectionContext'
import formStyles from './SchoolInspectionForm.module.css'
import {
    SCHOOL_INSPECTION_FIELDS,
    FACILITY_IDS,
    CAPACITY_IDS,
    SANITATION_IDS,
    TOTAL_TOILETS_ID,
} from './configs/schoolInspectionConfig'

const TOTAL_CLASSROOMS_ID = 'ya5SyA5hej4'
const CLEAN_CLASSROOMS_ID = 'XIgpDhDC4Ol'
import {
    computeTotalToilets,
    validateSchoolInspection,
    computeProgress,
    normalizeChange,
} from './configs/inspectionFormUtils'
import BooleanChoiceField from './components/BooleanChoiceField'
import ConditionRatingField from './components/ConditionRatingField'
import { CombinedIcon } from '../../../shared/ui/icons/Icon'
import { FIELD_ICONS } from './configs/fieldIcons'

const DRAFT_KEY_PREFIX = 'schoolInspectionDraft_'
const FIELD_LABEL_LOOKUP = SCHOOL_INSPECTION_FIELDS.reduce((acc, field) => {
    acc[field.id] = field.label
    if (field.child_query) {
        acc[field.child_query.id] = field.child_query.label
    }
    return acc
}, {})

const getDraftKey = orgUnitId =>
    orgUnitId ? `${DRAFT_KEY_PREFIX}${orgUnitId}` : null

const loadDraft = orgUnitId => {
    if (typeof window === 'undefined') return null
    const key = getDraftKey(orgUnitId)
    if (!key) return null
    try {
        const raw = window.localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

const saveDraft = (orgUnitId, state) => {
    if (typeof window === 'undefined') return
    const key = getDraftKey(orgUnitId)
    if (!key) return
    try {
        window.localStorage.setItem(key, JSON.stringify(state))
    } catch {}
}

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


function NumberField({ label, value = '', onChange, error, iconNames, max }) {
    const [isFocused, setIsFocused] = useState(false)
    const isBlank = value === '' || value === null || value === undefined
    const numericValue =
        isBlank ? 0 : Number(value) || 0

    const handleChange = (newValue) => {
        // If max is set and the new value exceeds it, cap it at max
        if (max !== undefined && max !== null) {
            const numValue = Number(newValue)
            if (!Number.isNaN(numValue) && numValue > max) {
                onChange(String(max))
                return
            }
        }
        onChange(newValue)
    }

    const handleIncrement = () => {
        // If blank, go to 0 first, otherwise increment
        if (isBlank) {
            handleChange('0')
        } else {
            const nextValue = numericValue + 1
            // If max is set and next value would exceed it, cap at max
            if (max !== undefined && max !== null && nextValue > max) {
                handleChange(String(max))
            } else {
                handleChange(String(nextValue))
            }
        }
    }

    const handleDecrement = () => {
        // If blank or 0, stay at 0 (or go to blank if already 0)
        if (isBlank || numericValue === 0) {
            handleChange('')
        } else {
            handleChange(String(numericValue - 1))
        }
    }

    return (
        <div className={`${formStyles.numberFieldContainer} ${error ? formStyles.numberFieldContainerError : ''}`}>
            <label className={`${formStyles.numberLabel} ${error ? formStyles.numberLabelError : ''}`}>
                {iconNames && iconNames.length > 0 && (
                    <CombinedIcon 
                        icons={iconNames} 
                        size={24} 
                        gap={6}
                        style={{ color: error ? '#b91c1c' : '#2563eb' }}
                    />
                )}
                <span>{label}</span>
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
                        {error}
                    </span>
                )}
            </label>
            <div className={formStyles.numberInputContainer}>
                <input
                    type="number"
                    min="0"
                    max={max !== undefined && max !== null ? max : undefined}
                    value={value}
                    onChange={e => handleChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`${formStyles.numberInput} ${error ? formStyles.numberInputError : ''}`}
                    aria-invalid={!!error}
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
    const [submitResult, setSubmitResult] = useState(null)

    const [missingRequiredLabels, setMissingRequiredLabels] = useState([])
    const [showMissingPopup, setShowMissingPopup] = useState(false)

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
        setSubmitResult(null)
        return
        }

        const draft = loadDraft(orgUnitId)
        setFormState(draft && typeof draft === 'object' ? draft : {})
        setErrors({})
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
    }, [orgUnitId])

    useEffect(() => {
        if (data || submitResult) {
            // beholder formState + draft som det er
            setErrors({})
            setMissingRequiredLabels([])
            setShowMissingPopup(false)
        }
    }, [data, submitResult])

    const handleChange = useCallback(
        (id, value, options = {}) => {
            setFormState(prev => {
                const updated = { ...prev, [id]: value }
                
                // If total classrooms is being changed, check if clean classrooms needs to be capped
                if (id === TOTAL_CLASSROOMS_ID) {
                    const totalRooms = Number(value) || 0
                    const cleanRooms = Number(prev[CLEAN_CLASSROOMS_ID]) || 0
                    if (cleanRooms > totalRooms && totalRooms > 0) {
                        updated[CLEAN_CLASSROOMS_ID] = String(totalRooms)
                    }
                }
                
                if (orgUnitId) {
                    saveDraft(orgUnitId, updated)
                }
                return updated
            })
            clearFieldError(id, value, options)
        },
        [clearFieldError, orgUnitId]
    )

    const handleReset = () => {
        if (
            !window.confirm(
                i18n.t(
                    'Are you sure you want to reset the form? All entered data will be lost.'
                )
            )
        )
            return

        setFormState({})
        setErrors({})
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
        orgUnitId && clearDraft(orgUnitId)
    }

    /* ------------------ VALIDATION ------------------ */

    const validateForm = useCallback(() => {
        const normalized = {}
        const errs = {}

        for (const field of SCHOOL_INSPECTION_FIELDS) {
            const id = field.id

            normalized[id] = normalizeChange(id, formState[id])

            if (field.child_query) {
                const cid = field.child_query.id
                normalized[cid] = normalizeChange(cid, formState[cid])
            }
        }

        const baseErrors = validateSchoolInspection(normalized) || {}

        const isEmpty = v => v === undefined || v === null || v === ''

        for (const field of SCHOOL_INSPECTION_FIELDS) {
            const id = field.id

            if (id === TOTAL_TOILETS_ID) continue

            if (field.type === 'BOOLEAN') {
                if (isEmpty(normalized[id]) && !baseErrors[id]) {
                    baseErrors[id] = 'Required'
                }
                if (field.child_query) {
                    const cid = field.child_query.id
                    const isTrue =
                        normalized[id] === true || normalized[id] === 'true'

                    if (isTrue && isEmpty(normalized[cid]) && !baseErrors[cid]) {
                        baseErrors[cid] = 'Required'
                    }
                }
            } else if (isEmpty(normalized[id]) && !baseErrors[id]) {
                baseErrors[id] = 'Required'
            }
        }

        setErrors(baseErrors)

        const missing = []
        for (const field of SCHOOL_INSPECTION_FIELDS) {
            if (field.id === TOTAL_TOILETS_ID) continue
            if (baseErrors[field.id] === 'Required') missing.push(field.label)
            if (
                field.child_query &&
                baseErrors[field.child_query.id] === 'Required'
            )
                missing.push(field.child_query.label)
        }
        setMissingRequiredLabels(missing)

        return { ok: Object.keys(baseErrors).length === 0, normalized }
    }, [formState])

    /* ------------------ SUBMISSION ------------------ */

    const totalToilets = computeTotalToilets(formState)

    const handleSubmit = async () => {
        const { ok, normalized } = validateForm()
        if (!ok) {
            setShowMissingPopup(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        const dataValues = []

        for (const field of SCHOOL_INSPECTION_FIELDS) {
            const id = field.id
            const val = normalized[id]

            if (val !== undefined && val !== null) {
                dataValues.push({
                    dataElement: id,
                    value: field.type === 'BOOLEAN' ? !!val : val,
                })
            }

            if (field.child_query) {
                const cid = field.child_query.id
                if (val === true && normalized[cid]) {
                    dataValues.push({
                        dataElement: cid,
                        value: normalized[cid],
                    })
                }
            }
        }

        dataValues.push({
            dataElement: TOTAL_TOILETS_ID,
            value: totalToilets,
        })

        setLastSubmitted(dataValues)

        setInspectionDict(prev => ({
            ...prev,
            [orgUnitId]: dataValues,
        }))

        const result = await submitInspection({
            orgUnit_id: orgUnitId,
            dataValues: dataValues,
        })

        // Store the result for display
        setSubmitResult(result)

        // Only navigate to history/comparison if online
        if (result?.isOnline !== false) {
            setActiveTab && setActiveTab('tldr')
        }
    }

    /* ------------------ RENDER FIELD ------------------ */

    const renderField = ({ id, label, type, child_query }) => {
        const value = formState[id]
        const childValue = child_query ? formState[child_query.id] : null
        const isTrue = value === true || value === 'true'

        if (type === 'BOOLEAN' && child_query) {
            const parentError = !!errors[id]
            const childError = !!errors[child_query.id]
            return (
                <div
                    key={id}
                    className={`${formStyles.fieldWrapper} ${
                        parentError || childError ? formStyles.fieldWrapperError : ''
                    }`}
                >
                    <div className={formStyles.fieldWrapperFlex}>
                        <div
                            className={`${formStyles.fieldWrapperFlexItem} ${
                                parentError ? formStyles.fieldWrapperFlexItemError : ''
                            }`}
                        >
                            <BooleanChoiceField
                                label={label}
                                value={value}
                                onChange={v => {
                                    handleChange(id, v)
                                    // Clear condition rating if unselected (null) or set to false
                                    if (v === null || v === false) {
                                        handleChange(child_query.id, null, {
                                            forceClearError: true,
                                        })
                                    }
                                }}
                                error={errors[id]}
                                trueLabel="Available"
                                falseLabel="Not available"
                            />
                        </div>
                        <div
                            className={`${formStyles.fieldWrapperFlexItemWide} ${
                                childError ? formStyles.fieldWrapperFlexItemWideError : ''
                            }`}
                        >
                            <ConditionRatingField
                                label={child_query.label}
                                value={childValue}
                                onChange={num =>
                                    handleChange(child_query.id, num)
                                }
                                disabled={!isTrue}
                                error={errors[child_query.id]}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (type === 'BOOLEAN') {
            return (
                <div
                    key={id}
                    className={`${formStyles.fieldWrapper} ${
                        errors[id] ? formStyles.fieldWrapperError : ''
                    }`}
                >
                    <BooleanChoiceField
                        label={label}
                        value={value}
                        onChange={v => handleChange(id, v)}
                        error={errors[id]}
                    />
                </div>
            )
        }

        // For clean and secure classrooms, set max to total classrooms
        const maxValue = id === CLEAN_CLASSROOMS_ID
            ? (formState[TOTAL_CLASSROOMS_ID] !== undefined && formState[TOTAL_CLASSROOMS_ID] !== null && formState[TOTAL_CLASSROOMS_ID] !== ''
                ? Number(formState[TOTAL_CLASSROOMS_ID])
                : undefined)
            : undefined

        return (
            <NumberField
                key={id}
                label={label}
                value={formState[id] ?? ''}
                onChange={val => handleChange(id, val)}
                error={errors[id]}
                iconNames={FIELD_ICONS[id]}
                max={maxValue}
            />
        )
    }

    /* ------------------ FIELD GROUPS ------------------ */

    const facilities = SCHOOL_INSPECTION_FIELDS.filter(f =>
        FACILITY_IDS.includes(f.id)
    )
    const capacity = SCHOOL_INSPECTION_FIELDS.filter(f =>
        CAPACITY_IDS.includes(f.id)
    )
    const sanitation = SCHOOL_INSPECTION_FIELDS.filter(f =>
        SANITATION_IDS.includes(f.id)
    )

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    /* ------------------ RENDER ------------------ */

    return (
        <div className={formStyles.formContainer}>
            {/* Validation error notification at bottom */}
            {showMissingPopup && missingRequiredLabels.length > 0 && (
                <div className={formStyles.popupOverlay}>
                    <div className={formStyles.popup}>
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowMissingPopup(false)}
                            className={formStyles.popupCloseButton}
                            aria-label={i18n.t('Close')}
                        >
                            <IconCross16 />
                        </button>

                        <div className={formStyles.popupContent}>
                            <div className={formStyles.popupHeader}>
                                <div className={formStyles.popupIcon}>
                                    <IconWarning16 />
                                </div>
                                <div className={formStyles.popupText}>
                                    <strong className={formStyles.popupTitle}>
                                        {i18n.t('Please complete all required fields')}
                                    </strong>
                                    <div className={formStyles.popupDescription}>
                                        {i18n.t('The following {{count}} field(s) need to be filled:', { count: missingRequiredLabels.length })}
                                    </div>
                                    <ul className={formStyles.popupList}>
                                        {missingRequiredLabels.map(label => (
                                            <li key={label} className={formStyles.popupListItem}>
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
            <div className={formStyles.header}>
                <div className={formStyles.headerLeft}>
                    <h3 className={formStyles.headerTitle}>
                        {i18n.t('School inspection')} – {orgUnitName || orgUnitId}
                    </h3>
                    <p className={formStyles.headerSubtitle}>
                        {i18n.t('Inspection date')}: {inspectionDateLabel}
                    </p>
                </div>
                <div className={formStyles.headerStats}>
                    {filledCount} / {totalCount} {i18n.t('fields completed')}
                </div>
            </div>

            {/* progress bar */}
            <div className={formStyles.progressSection}>
                <div className={formStyles.progressBar}>
                    <div
                        className={`${formStyles.progressBarFill} ${progressPct === 100 ? formStyles.progressBarFillComplete : ''}`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className={formStyles.progressStats}>
                    <span>Progress: {filledCount} of {totalCount} fields</span>
                    <span className={`${formStyles.progressPercentage} ${progressPct === 100 ? formStyles.progressPercentageComplete : ''}`}>
                        {Math.round(progressPct)}%
                    </span>
                </div>
            </div>

            {loading && (
                <div className={formStyles.loadingIndicator}>
                    <CircularLoader small />
                    <span className={formStyles.loadingText}>
                        {i18n.t('Submitting inspection...')}
                    </span>
                </div>
            )}

            {!loading && (
                <>
                    <details open className={formStyles.sectionBox}>
                        <summary className={formStyles.sectionSummary}>
                            Facilities
                        </summary>
                        <p className={formStyles.sectionDescription}>
                            Select if available and rate condition from 1–5.
                        </p>
                        <div className={formStyles.facilitiesContainer}>
                            {facilities.map(renderField)}
                        </div>
                    </details>

                    <details open className={formStyles.sectionBox}>
                        <summary className={formStyles.sectionSummary}>
                            Capacity
                        </summary>
                        <p className={formStyles.sectionDescription}>
                            Enter basic counts for classrooms, learners, seats
                            and teachers.
                        </p>
                        <div className={`${formStyles.sectionGrid} ${formStyles.capacityGrid}`}>
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    <details open className={formStyles.sectionBox}>
                        <summary className={formStyles.sectionSummary}>
                            Sanitation & staffing
                        </summary>
                        <p className={formStyles.sectionDescription}>
                            Report toilets per group. Total toilets is
                            calculated automatically.
                        </p>
                        <div className={`${formStyles.sectionGrid} ${formStyles.sanitationGrid}`}>
                            {sanitation.map(renderField)}
                        </div>
                        <div className={formStyles.totalToiletsBox}>
                            <strong className={formStyles.totalToiletsLabel}>
                                Total toilets:
                            </strong>
                            <span className={formStyles.totalToiletsValue}>
                                {totalToilets}
                            </span>
                        </div>
                    </details>

                    <div className={formStyles.actionsContainer}>
                        <div className={formStyles.actionsButtons}>
                            <div className={formStyles.actionsButtonsInner}>
                                <Button
                                    onClick={handleReset}
                                    disabled={loading}
                                    large
                                >
                                    <span className={formStyles.buttonTextFull}>{i18n.t('Reset form')}</span>
                                    <span className={formStyles.buttonTextShort}>Reset</span>
                                </Button>
                                <Button
                                    primary
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    large
                                    style={{ minWidth: 140 }}
                                >
                                    <span className={formStyles.buttonTextFull}>{i18n.t('Submit inspection')}</span>
                                    <span className={formStyles.buttonTextShort}>Submit</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {(data || submitResult) && (
                        <AlertStack>
                            <AlertBar 
                                success={submitResult?.isOnline !== false && data} 
                                warning={submitResult?.isOnline === false}
                                duration={8000}
                            >
                                <div>
                                    {submitResult?.isOnline === false ? (
                                        <>
                                            <strong>{i18n.t('You are offline')}</strong>
                                            <div className={formStyles.alertMessage}>
                                                {submitResult?.message || i18n.t('You are offline. You request has been stored, and will be posted when back online. No comparison available')}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <strong>{i18n.t('Inspection submitted successfully!')}</strong>
                                            <div className={formStyles.alertMessage}>
                                                {i18n.t('{{count}} fields saved', { count: lastSubmitted.length })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {error && (
                        <AlertStack>
                            <AlertBar critical duration={10000}>
                                <div>
                                    <strong>{i18n.t('Error submitting inspection')}</strong>
                                    <div className={formStyles.alertMessage}>
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
