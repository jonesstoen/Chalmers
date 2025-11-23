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

/* ------------------ Draft Storage ------------------ */

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
    } catch {}
}

/* ------------------ Number Field ------------------ */

function NumberField({ label, value = '', onChange, error, iconNames }) {
    const [isFocused, setIsFocused] = useState(false)
    const numericValue =
        value === '' || value === null || value === undefined
            ? 0
            : Number(value) || 0

    const handleIncrement = () => onChange(String(numericValue + 1))
    const handleDecrement = () =>
        numericValue > 0 && onChange(String(numericValue - 1))

    return (
        <div
            style={{
                marginBottom: 0,
                ...(error && {
                    padding: '12px',
                    borderRadius: 8,
                    background: '#fef2f2',
                    border: '2px solid #f87171',
                }),
            }}
        >
            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    color: error ? '#b91c1c' : '#0f172a',
                }}
            >
                {iconNames?.length > 0 && (
                    <CombinedIcon
                        icons={iconNames}
                        size={24}
                        gap={6}
                        style={{ color: error ? '#b91c1c' : '#2563eb' }}
                    />
                )}
                <span>{label}</span>
                {error && (
                    <span
                        style={{
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
                        }}
                    >
                        <IconError16 />
                        Required
                    </span>
                )}
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        flex: 1,
                        padding: '14px 16px',
                        borderRadius: 8,
                        border: `2px solid ${
                            error ? '#f87171' : isFocused ? '#2563eb' : '#cbd5e1'
                        }`,
                        fontSize: 16,
                        outline: 'none',
                    }}
                />

                <Button
                    onClick={handleDecrement}
                    disabled={numericValue <= 0}
                    icon={<IconSubtract16 />}
                    small
                />
                <Button
                    onClick={handleIncrement}
                    icon={<IconAdd16 />}
                    small
                />
            </div>
        </div>
    )
}

/* =====================================================
   MAIN COMPONENT — HOOKS MUST BE AT TOP, ALWAYS
   ===================================================== */

export default function SchoolInspectionForm({
                                                 orgUnitId,
                                                 orgUnitName,
                                                 setActiveTab,
                                             }) {
    /* ------------------ ALL HOOKS AT TOP ------------------ */

    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [lastSubmitted, setLastSubmitted] = useState([])

    const [missingRequiredLabels, setMissingRequiredLabels] = useState([])
    const [showMissingPopup, setShowMissingPopup] = useState(false)

    // SUBMIT HOOK — IMPORTANT: must be here, not below any conditions.
    const [submitInspection, { loading, error, data }] =
        usePostSchoolInspectionEvent()

    // CONTEXT — must be below submit hook
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext)

    /* ------------------ NON-HOOK VARIABLES ------------------ */
    const inspectionDateLabel = new Date().toLocaleDateString()

    /* ------------------ EFFECTS ------------------ */

    useEffect(() => {
        if (!orgUnitId) {
            setFormState({})
            setErrors({})
            setMissingRequiredLabels([])
            setShowMissingPopup(false)
            return
        }

        const draft = loadDraft(orgUnitId)
        setFormState(draft && typeof draft === 'object' ? draft : {})
        setErrors({})
        setMissingRequiredLabels([])
        setShowMissingPopup(false)
    }, [orgUnitId])

    useEffect(() => {
        if (data) {
            setErrors({})
            setMissingRequiredLabels([])
            setShowMissingPopup(false)
        }
    }, [data])

    /* ------------------ HANDLERS ------------------ */

    const handleChange = (id, value) => {
        setFormState(prev => {
            const updated = { ...prev, [id]: value }
            orgUnitId && saveDraft(orgUnitId, updated)
            return updated
        })
    }

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

        await submitInspection({
            orgUnit_id: orgUnitId,
            dataValues: dataValues,
        })

        setActiveTab && setActiveTab('tldr')
    }

    /* ------------------ RENDER FIELD ------------------ */

    const renderField = ({ id, label, type, child_query }) => {
        const value = formState[id]
        const childValue = child_query ? formState[child_query.id] : null
        const isTrue = value === true || value === 'true'

        if (type === 'BOOLEAN' && child_query) {
            return (
                <div key={id} style={{ marginBottom: '1.5rem' }}>
                    <div
                        style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}
                    >
                        <BooleanChoiceField
                            label={label}
                            value={value}
                            onChange={v => {
                                handleChange(id, v)
                                if (v !== true) handleChange(child_query.id, null)
                            }}
                            error={errors[id]}
                            trueLabel="Available"
                            falseLabel="Not available"
                        />

                        <ConditionRatingField
                            label={child_query.label}
                            value={
                                childValue !== '' && childValue !== null
                                    ? Number(childValue)
                                    : null
                            }
                            onChange={num => handleChange(child_query.id, num)}
                            disabled={!isTrue}
                            error={errors[child_query.id]}
                        />
                    </div>
                </div>
            )
        }

        if (type === 'BOOLEAN') {
            return (
                <div key={id} style={{ marginBottom: '1.5rem' }}>
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
            {/* Progress + Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>
                    {i18n.t('School inspection')} – {orgUnitName || orgUnitId}
                </h3>
                <span style={{ color: '#64748b' }}>
                    {filledCount}/{totalCount} {i18n.t('fields completed')}
                </span>
            </div>

            <div
                style={{
                    height: 8,
                    background: '#e5e7eb',
                    borderRadius: 999,
                    overflow: 'hidden',
                    marginBottom: 24,
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${progressPct}%`,
                        background:
                            progressPct === 100 ? '#16a34a' : '#2563eb',
                        transition: 'width .3s ease',
                    }}
                />
            </div>

            {/* Loader */}
            {loading && (
                <div style={{ display: 'flex', gap: 12, padding: 16 }}>
                    <CircularLoader small />
                    <span>{i18n.t('Submitting inspection...')}</span>
                </div>
            )}

            {!loading && (
                <>
                    {/* Facilities */}
                    <details open>
                        <summary>Facilities</summary>
                        {facilities.map(renderField)}
                    </details>

                    {/* Capacity */}
                    <details open>
                        <summary>Capacity</summary>
                        {capacity.map(renderField)}
                    </details>

                    {/* Sanitation */}
                    <details open>
                        <summary>Sanitation</summary>
                        {sanitation.map(renderField)}
                    </details>

                    <div style={{ marginTop: 16 }}>
                        <strong>Total toilets:</strong> {totalToilets}
                    </div>

                    {/* Buttons */}
                    <div
                        style={{
                            marginTop: '2rem',
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button onClick={handleReset}>
                            {i18n.t('Reset form')}
                        </Button>
                        <Button primary onClick={handleSubmit}>
                            {i18n.t('Submit inspection')}
                        </Button>
                    </div>

                    {/* Alerts */}
                    {data && (
                        <AlertStack>
                            <AlertBar success>
                                {i18n.t('Inspection submitted successfully!')}
                            </AlertBar>
                        </AlertStack>
                    )}

                    {error && (
                        <AlertStack>
                            <AlertBar critical>
                                {i18n.t('Error submitting inspection')}
                            </AlertBar>
                        </AlertStack>
                    )}
                </>
            )}
        </div>
    )
}
