import React, { useEffect, useState } from 'react'
import { Button, InputField, CheckboxField, CircularLoader } from '@dhis2/ui'
import usePostSchoolInspectionEvent from '../hooks/usePostSchoolInspectionEvent'

const schoolInspectionFields = [
    { id: 'Nvp4hIbXrzF', label: 'Computer Lab present?', type: 'BOOLEAN', child_query: { id: 'gzhjCMe7OyS', label: 'Computer Lab condition (1–5)', type: 'INTEGER_POSITIVE' } },
    { id: 'IKiSAA19Xvl', label: 'Electricity available?', type: 'BOOLEAN', child_query:{ id: 'MH2eDd7qWxR', label: 'Electricity condition (1–5)', type: 'INTEGER_POSITIVE' } },
    { id: 'n9KwS4rY2HC', label: 'Handwashing available?', type: 'BOOLEAN', child_query: { id: 'ie3bFiVatHT', label: 'Handwashing condition (1–5)', type: 'INTEGER_POSITIVE' } }, 
    { id: 'Y6DQqwTdhiZ', label: 'Library available?', type: 'BOOLEAN', child_query: { id: 'IAomDvMcUDr', label: 'Library condition (1–5)', type: 'NUMBER' }},
    { id: 'XThfmg6f2oC', label: 'Playground available?', type: 'BOOLEAN', child_query:{ id: 'JzZfwXtdL6G', label: 'Playground condition (1–5)', type: 'INTEGER_POSITIVE' }},
    { id: 'ya5SyA5hej4', label: 'Number of classrooms', type: 'NUMBER' }, 
    { id: 'XIgpDhDC4Ol', label: 'Number of clean and secure classrooms', type: 'NUMBER' }, 
    { id: 'I13NTyLrHBm', label: 'Toilets for teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'QXcKg7GSr4e', label: 'Toilets for boys', type: 'NUMBER' },
    { id: 'OGmIo4kFUYr', label: 'Toilets for girls', type: 'NUMBER' },
    // Total toilets will be auto-calculated id : iytoDmoTUWY 
    { id: 'DO0LBJfXY00', label: 'Learners (students)', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'jcC1uz56IpY', label: 'Number of seats', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'LME331J5aev', label: 'Number of teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
]

export default function SchoolInspectionForm({ orgUnitId }) {
    const [formState, setFormState] = useState({})
    const [errors, setErrors] = useState({})
    const [submitInspection, { loading, error, data }] = usePostSchoolInspectionEvent()

    useEffect(() => { 
            if(data){
                setFormState({})
                setErrors({}) 
            }
        },[data])

    const handleChange = (id, value) => {
        let newValue = value
        // Ensure no negative numbers
        if (typeof value === 'number' && value < 0) newValue = 0

        // Cap child condition fields to max 5
        const childFieldsIds = ['gzhjCMe7OyS','MH2eDd7qWxR','ie3bFiVatHT','IAomDvMcUDr','JzZfwXtdL6G']
        if (childFieldsIds.includes(id) && value > 5) newValue = 5

        setFormState(prev => ({ ...prev, [id]: newValue }))
    }

    // Auto-calculate total toilets
    const totalToilets = 
        (Number(formState['I13NTyLrHBm']) || 0) +
        (Number(formState['QXcKg7GSr4e']) || 0) +
        (Number(formState['OGmIo4kFUYr']) || 0)

    const validateForm = () => {
        const newErrors = {}

        // Clean classrooms cannot exceed total classrooms
        if ((formState['XIgpDhDC4Ol'] || 0) > (formState['ya5SyA5hej4'] || 0)) {
            newErrors['XIgpDhDC4Ol'] = 'Cannot exceed total classrooms'
        }

        // Validate child fields
        schoolInspectionFields.forEach(field => {
            if (field.child_query) {
                const childId = field.child_query.id
                const childValue = formState[childId]

                // Cannot set child condition if parent is unchecked
                if (childValue != null && !formState[field.id]) {
                    newErrors[childId] = 'Cannot set condition without parent being checked'
                }

                // Child value must be between 1 and 5
                if (childValue != null && (childValue < 1 || childValue > 5)) {
                    newErrors[childId] = 'Value must be between 1 and 5'
                }
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        const dataValuesArray = Object.entries(formState).map(([dataElement, value]) => ({ dataElement, value }))
        // Add total toilets
        dataValuesArray.push({ dataElement: 'iytoDmoTUWY', value: totalToilets })

        submitInspection({ orgUnit_id: orgUnitId, dataValues: dataValuesArray })
    }

    if(!formState){
        return <CircularLoader/> 
    }

    return (
        <div style={{ marginTop: '1rem' }}>
            <h3>School Inspection – Form</h3>

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
                                        handleChange(id, !(formState[id] === 'true' || formState[id] === true))
                                    }
                                />
                            ) : (
                                <InputField
                                    label={label}
                                    type="number"
                                    min="0"
                                    value={formState[id] || ''}
                                    onChange={({ value }) => handleChange(id, value)}
                                    error={errors[id]}
                                />
                            )}

                            {/* Render child query only if parent boolean is true */}
                            {child_query && formState[id] === true && (
                                <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                                    <InputField
                                        label={child_query.label}
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={formState[child_query.id] || ''}
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

                    {data && <p style={{ color: 'green' }}>Posted the data</p>}
{error && (
                <div style={{ color: 'red', marginTop: '1rem' }}>
                    <p><strong>Error:</strong> {error.message || 'An unexpected error occurred'}</p>
                    {error.code && <p><strong>Code:</strong> {error.code}</p>}
                    {error.details && <pre>{JSON.stringify(error.details, null, 2)}</pre>}
                </div>
            )}
                </>
            )}
        </div>
    )
}
