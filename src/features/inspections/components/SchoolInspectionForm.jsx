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
        label: 'Computer Lab present?',
        type: 'BOOLEAN',
        child_query: {
            id: 'gzhjCMe7OyS',
            label: 'Computer Lab condition (1–5)',
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
        label: 'Handwashing available?',
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

    return (
        <div style={{ marginTop: '1rem' }}>
            <h3>School Inspection at {orgUnitId}</h3>

            {loading && <CircularLoader small />}

            {!loading && (
                <>
                    {schoolInspectionFields.map(({ id, label, type, child_query }) => (
                        <div key={id} style={{ marginBottom: '1rem' }}>
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
                                <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
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
                    ))}

                    <div style={{ marginBottom: '1rem' }}>
                        <strong>Total toilets: {totalToilets}</strong>
                    </div>

                    <Button primary onClick={handleSubmit} disabled={loading}>
                        Submit Inspection
                    </Button>

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