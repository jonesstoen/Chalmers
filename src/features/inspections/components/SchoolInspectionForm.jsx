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

const schoolInspectionFields = [
    {
        id: 'Nvp4hIbXrzF',
        label: 'Computer lab available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'gzhjCMe7OyS',
            label: 'Computer lab condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    {
        id: 'IKiSAA19Xvl',
        label: 'Electricity available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'MH2eDd7qWxR',
            label: 'Electricity condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    {
        id: 'n9KwS4rY2HC',
        label: 'Handwashing facilities available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'ie3bFiVatHT',
            label: 'Handwashing condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    {
        id: 'Y6DQqwTdhiZ',
        label: 'Library available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'IAomDvMcUDr',
            label: 'Library condition (1–5)',
            type: 'NUMBER',
        },
    },
    {
        id: 'XThfmg6f2oC',
        label: 'Playground available?',
        type: 'BOOLEAN',
        child_query: {
            id: 'JzZfwXtdL6G',
            label: 'Playground condition (1–5)',
            type: 'INTEGER_POSITIVE',
        },
    },
    { id: 'ya5SyA5hej4', label: 'Number of classrooms', type: 'NUMBER' },
    {
        id: 'XIgpDhDC4Ol',
        label: 'Number of clean and secure classrooms',
        type: 'NUMBER',
    },
    { id: 'I13NTyLrHBm', label: 'Toilets for teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'QXcKg7GSr4e', label: 'Toilets for boys', type: 'NUMBER' },
    { id: 'OGmIo4kFUYr', label: 'Toilets for girls', type: 'NUMBER' },
    // Total toilets (iytoDmoTUWY) blir auto-beregnet under
    { id: 'DO0LBJfXY00', label: 'Learners (students)', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'jcC1uz56IpY', label: 'Number of seats', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'LME331J5aev', label: 'Number of teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
]

// grupper for layout/UX
const FACILITY_IDS = ['Nvp4hIbXrzF', 'IKiSAA19Xvl', 'n9KwS4rY2HC', 'Y6DQqwTdhiZ', 'XThfmg6f2oC']
const CAPACITY_IDS = ['ya5SyA5hej4', 'XIgpDhDC4Ol', 'DO0LBJfXY00', 'jcC1uz56IpY', 'LME331J5aev']
const SANITATION_IDS = ['I13NTyLrHBm', 'QXcKg7GSr4e', 'OGmIo4kFUYr']

export default function SchoolInspectionForm({ orgUnitId, setActiveTab }) {
    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [lastSubmitted, setLastSubmitted] = useState([])
    const [submitInspection, { loading, error, data }] = usePostSchoolInspectionEvent()
    const [inspectionDict, setInspectionDict] = useContext(InspectionContext)

    // Reset form ved vellykket submit
    useEffect(() => {
        if (data) {
            setFormState({})
            setErrors({})
        }
    }, [data])

    const handleChange = (id, value) => {
        let newValue = value

        // InputField gir string → konverter for sjekker
        const numeric = Number(value)
        const isNumeric = !Number.isNaN(numeric)

        // Ingen negative tall
        if (isNumeric && numeric < 0) {
            newValue = 0
        }

        // Barn-felter (condition 1–5) skal være maks 5
        const childFieldsIds = [
            'gzhjCMe7OyS',
            'MH2eDd7qWxR',
            'ie3bFiVatHT',
            'IAomDvMcUDr',
            'JzZfwXtdL6G',
        ]
        if (childFieldsIds.includes(id) && isNumeric && numeric > 5) {
            newValue = 5
        }

        setFormState(prev => ({
            ...prev,
            [id]: newValue,
        }))
    }

    // Auto-beregn total toilets (iytoDmoTUWY)
    const totalToilets =
        (Number(formState['I13NTyLrHBm']) || 0) +
        (Number(formState['QXcKg7GSr4e']) || 0) +
        (Number(formState['OGmIo4kFUYr']) || 0)

    const validateForm = () => {
        const newErrors = {}

        // Clean classrooms kan ikke overstige total classrooms
        const clean = Number(formState['XIgpDhDC4Ol']) || 0
        const totalRooms = Number(formState['ya5SyA5hej4']) || 0
        if (clean > totalRooms) {
            newErrors['XIgpDhDC4Ol'] = 'Cannot exceed total classrooms'
        }

        // Valider barn-felter (1–5)
        schoolInspectionFields.forEach(field => {
            if (field.child_query) {
                const childId = field.child_query.id
                const rawChild = formState[childId]

                if (rawChild != null && rawChild !== '') {
                    const childValue = Number(rawChild)
                    if (Number.isNaN(childValue) || childValue < 1 || childValue > 5) {
                        newErrors[childId] = 'Value must be between 1 and 5'
                    }
                }
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const dataValuesArray = schoolInspectionFields.reduce((acc, field) => {
            const parentId = field.id
            const parentValue = formState[parentId]

            // vi beholder 0 / false, men skipper undefined/null
            if (parentValue === undefined || parentValue === null) {
                return acc
            }

            // boolean-felt: lagre true/false
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

            // child-felt kun hvis definert OG parent er true
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

        // Legg inn auto-beregnet total toilets
        dataValuesArray.push({
            dataElement: 'iytoDmoTUWY',
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

        // Bytt til Recent Summary-tab
        if (setActiveTab) {
            setActiveTab('tldr')
        }
    }

    // progress-indikator (enkel)
    const { filledCount, totalCount, progressPct } = (() => {
        let filled = 0
        let total = 0

        schoolInspectionFields.forEach(field => {
            total += 1
            const v = formState[field.id]
            if (v !== undefined && v !== '') filled += 1

            if (field.child_query) {
                total += 1
                const cv = formState[field.child_query.id]
                if (cv !== undefined && cv !== '') filled += 1
            }
        })

        const pct = total > 0 ? Math.round((filled / total) * 100) : 0
        return { filledCount: filled, totalCount: total, progressPct: pct }
    })()

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

            {/* child-felt vises bare hvis parent-checkbox er true */}
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

    const facilities = schoolInspectionFields.filter(f => FACILITY_IDS.includes(f.id))
    const capacity = schoolInspectionFields.filter(f => CAPACITY_IDS.includes(f.id))
    const sanitation = schoolInspectionFields.filter(f => SANITATION_IDS.includes(f.id))

    return (
        <div
            style={{
                marginTop: '1rem',
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 16,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
            }}
        >
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
                <h3 style={{ margin: 0 }}>School inspection at {orgUnitId}</h3>
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
                    {/* Facilities */}
                    <section style={{ marginBottom: '1.5rem' }}>
                        <h4
                            style={{
                                marginBottom: '0.5rem',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0f172a',
                            }}
                        >
                            Facilities
                        </h4>
                        <p
                            style={{
                                marginTop: 0,
                                marginBottom: '0.75rem',
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Check which facilities are available at the school and rate their
                            condition from 1 (very poor) to 5 (excellent).
                        </p>
                        {facilities.map(renderField)}
                    </section>

                    {/* Capacity */}
                    <section style={{ marginBottom: '1.5rem' }}>
                        <h4
                            style={{
                                marginBottom: '0.5rem',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0f172a',
                            }}
                        >
                            Capacity
                        </h4>
                        <p
                            style={{
                                marginTop: 0,
                                marginBottom: '0.75rem',
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Provide numbers for classrooms, learners, seats and teachers to
                            understand how crowded the school is.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {capacity.map(renderField)}
                        </div>
                    </section>

                    {/* Sanitation & staffing */}
                    <section style={{ marginBottom: '1.5rem' }}>
                        <h4
                            style={{
                                marginBottom: '0.5rem',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#0f172a',
                            }}
                        >
                            Sanitation & staffing
                        </h4>
                        <p
                            style={{
                                marginTop: 0,
                                marginBottom: '0.75rem',
                                fontSize: 12,
                                color: '#64748b',
                            }}
                        >
                            Report available toilets for different groups. Total toilets are
                            calculated automatically.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: 16,
                            }}
                        >
                            {sanitation.map(renderField)}
                        </div>

                        <div style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
                            <strong>Total toilets: {totalToilets}</strong>
                        </div>
                    </section>

                    <div
                        style={{
                            marginTop: 8,
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button
                            primary
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ minWidth: 180 }}
                        >
                            Submit inspection
                        </Button>
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