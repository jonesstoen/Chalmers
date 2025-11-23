// pages/SchoolInspectionPage/newInspection/SchoolInspectionForm.jsx

import React, { useContext, useEffect, useState } from 'react'
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
import {
    computeTotalToilets,
    validateSchoolInspection,
    computeProgress,
    normalizeChange,
} from './configs/inspectionFormUtils'
import BooleanChoiceField from './components/BooleanChoiceField'
import ConditionRatingField from './components/ConditionRatingField'
import Icon, { CombinedIcon } from '../../../shared/ui/icons/Icon'
import { FIELD_ICONS } from './configs/fieldIcons'

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


function NumberField({ label, value = '', onChange, error, iconNames }) {
    const [isFocused, setIsFocused] = React.useState(false)
    const numericValue = value === '' || value === null || value === undefined ? 0 : Number(value) || 0

    const handleIncrement = () => {
        onChange(String(numericValue + 1))
    }

    const handleDecrement = () => {
        // Allow going down to 0
        onChange(String(Math.max(0, numericValue - 1)))
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
                        Required
                    </span>
                )}
            </label>
            <div className={formStyles.numberInputContainer}>
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`${formStyles.numberInput} ${error ? formStyles.numberInputError : ''}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${label}-error` : undefined}
                />
                <Button
                    onClick={handleDecrement}
                    disabled={numericValue < 0}
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
                    className={formStyles.numberError}
                    role="alert"
                >
                    <IconError16 />
                    <span>{error}</span>
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

    const handleReset = () => {
        if (
            !window.confirm(
                i18n.t('Are you sure you want to reset the form? All entered data will be lost.')
            )
        ) {
            return
        }

        setFormState({})
        setErrors({})
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
        if (orgUnitId) {
            clearDraft(orgUnitId)
        }
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
                <div key={id} className={formStyles.fieldWrapper}>
                    <div className={formStyles.fieldWrapperFlex}>
                        <div className={formStyles.fieldWrapperFlexItem}>
                            <BooleanChoiceField
                                label={label}
                                value={value}
                                onChange={v => {
                                    handleChange(id, v)
                                    // Clear condition rating if unselected (null) or set to false
                                    if (v === null || v === false) {
                                        handleChange(child_query.id, null)
                                    }
                                }}
                                error={errors[id]}
                                trueLabel="Available"
                                falseLabel="Not available"
                            />
                        </div>
                        <div className={formStyles.fieldWrapperFlexItemWide}>
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
                </div>
            )
        }

        if (type === 'BOOLEAN') {
            return (
                <div key={id} className={formStyles.fieldWrapper}>
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
                iconNames={FIELD_ICONS[id]}
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

                    <div className={formStyles.submitButtonContainer}>
                        <Button
                            onClick={handleReset}
                            disabled={loading}
                            large
                        >
                            {i18n.t('Reset form')}
                        </Button>
                        <Button
                            primary
                            onClick={handleSubmit}
                            disabled={loading}
                            large
                        >
                            {loading ? i18n.t('Submitting...') : i18n.t('Submit inspection')}
                        </Button>
                    </div>

                    {data && (
                        <AlertStack>
                            <AlertBar success duration={8000}>
                                <div>
                                    <strong>{i18n.t('Inspection submitted successfully!')}</strong>
                                    <div className={formStyles.alertMessage}>
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