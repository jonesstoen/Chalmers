// features/inspections/components/EditInspectionForm.jsx
import React, { useEffect, useState } from 'react'
import {
    Button,
    InputField,
    CheckboxField,
    CircularLoader,
    NoticeBox,
    AlertStack,
    AlertBar,
} from '@dhis2/ui'
import { useUpdateSchoolInspectionEvent } from '../hooks/useUpdateSchoolInspection'
import { useDeleteSchoolInspectionEvent } from '../hooks/useDeleteSchoolInspection'

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

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID   = 'eJiBjm9Rl7E'

export default function EditInspectionForm({ event, orgUnitId, orgUnitName, onDeleted }) {
    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [lastSaved, setLastSaved] = useState(null)

    const [updateEvent, { loading: saving, error: saveError }] =
        useUpdateSchoolInspectionEvent()
    const [deleteEvent, { loading: deleting, error: deleteError }] =
        useDeleteSchoolInspectionEvent()

    // Når valgt event endres → populér formState
    useEffect(() => {
        if (!event) return

        const next = {}

        SCHOOL_INSPECTION_FIELDS.forEach(field => {
            const raw = event[field.id]

            if (field.type === 'BOOLEAN') {
                next[field.id] = raw === true || raw === 'true'
            } else {
                next[field.id] = raw === undefined || raw === null ? '' : raw
            }

            if (field.child_query) {
                const childRaw = event[field.child_query.id]
                if (childRaw !== undefined && childRaw !== null) {
                    next[field.child_query.id] = childRaw
                }
            }
        })

        setFormState(next)
        setErrors({})
        setLastSaved(null)
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
        const newValue = normalizeChange(id, value)
        setFormState(prev => ({
            ...prev,
            [id]: newValue,
        }))
    }

    const totalToilets = computeTotalToilets(formState)

    const validateForm = () => {
        const newErrors = validateSchoolInspection(formState)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
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

        if (!validateForm()) return

        const dataValuesArray = SCHOOL_INSPECTION_FIELDS.reduce((acc, field) => {
            const parentId = field.id
            const parentValue = formState[parentId]

            if (parentValue === undefined || parentValue === null) {
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
        }, [])

        // Overstyr total toilets
        dataValuesArray.push({
            dataElement: 'iytoDmoTUWY',
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
        alert('Event updated!')
    }

    const handleDelete = async () => {
        if (!eventId) {
            alert('Missing eventId for delete')
            return
        }
        if (!window.confirm(`Delete event ${eventId}? This cannot be undone.`)) return

        await deleteEvent({ eventId })
        alert('Event deleted.')

        if (onDeleted) onDeleted(eventId)
    }

    const { filledCount, totalCount, progressPct } = computeProgress(formState)

    const renderField = ({ id, label, type, child_query }) => (
        <div key={id} style={{ marginBottom: '0.75rem' }}>
            {type === 'BOOLEAN' ? (
                <CheckboxField
                    label={label}
                    checked={formState[id] === true || formState[id] === 'true'}
                    onChange={() =>
                        handleChange(
                            id,
                            !(formState[id] === true || formState[id] === 'true')
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
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        <strong>Date:</strong> {inspectionDateLabel}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                        <strong>Event ID:</strong> {eventId}
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

            {isBusy && <CircularLoader small />}

            {!isBusy && (
                <>
                    {/* Facilities */}
                    <details open style={{ marginBottom: '1rem' }}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 14,
                                color: '#0f172a',
                                listStyle: 'none',
                                outline: 'none',
                            }}
                        >
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
                            Edit which facilities are available and adjust their condition if
                            needed.
                        </p>
                        {facilities.map(renderField)}
                    </details>

                    {/* Capacity */}
                    <details open style={{ marginBottom: '1rem' }}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 14,
                                color: '#0f172a',
                                listStyle: 'none',
                                outline: 'none',
                            }}
                        >
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
                            Update numbers for classrooms, learners, seats and teachers.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: 16,
                            }}
                        >
                            {capacity.map(renderField)}
                        </div>
                    </details>

                    {/* Sanitation & staffing */}
                    <details open style={{ marginBottom: '4rem' }}>
                        <summary
                            style={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 14,
                                color: '#0f172a',
                                listStyle: 'none',
                                outline: 'none',
                            }}
                        >
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
                            Adjust toilets per group. Total toilets is recalculated automatically.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: 16,
                            }}
                        >
                            {sanitation.map(renderField)}
                        </div>

                        <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                            <strong>Total toilets: {totalToilets}</strong>
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
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 12,
                                    color: '#64748b',
                                }}
                            >
                                {filledCount} of {totalCount} fields completed
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    primary
                                    onClick={handleSave}
                                    disabled={saving || deleting}
                                    style={{ minWidth: 140 }}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                                <Button
                                    destructive
                                    onClick={handleDelete}
                                    disabled={saving || deleting}
                                >
                                    {deleting ? 'Deleting…' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {lastSaved && (
                        <AlertStack>
                            <AlertBar success duration={6000}>
                                <p>
                                    <strong>Saved:</strong>{' '}
                                    {`Updated event with ${lastSaved} fields.`}
                                </p>
                            </AlertBar>
                        </AlertStack>
                    )}

                    {saveError && (
                        <div style={{ color: 'crimson', marginTop: '1rem' }}>
                            <p>
                                <strong>Error saving:</strong>{' '}
                                {saveError.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                    )}

                    {deleteError && (
                        <div style={{ color: 'crimson', marginTop: '0.5rem' }}>
                            <p>
                                <strong>Error deleting:</strong>{' '}
                                {deleteError.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}