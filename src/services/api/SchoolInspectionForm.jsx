import React, { useState } from 'react'
import { Button, InputField, CheckboxField, CircularLoader } from '@dhis2/ui'
import { usePostSchoolInspectionEvent } from './usePostSchoolInspectionEvent'

const schoolInspectionFields = [
    { id: 'Nvp4hIbXrzF', label: 'Computer Lab present?', type: 'BOOLEAN' },
    { id: 'gzhjCMe7OyS', label: 'Computer Lab condition (1–5)', type: 'INTEGER_POSITIVE' },
    { id: 'IKiSAA19Xvl', label: 'Electricity available?', type: 'BOOLEAN' },
    { id: 'MH2eDd7qWxR', label: 'Electricity condition (1–5)', type: 'INTEGER_POSITIVE' },
    { id: 'n9KwS4rY2HC', label: 'Handwashing available?', type: 'BOOLEAN' },
    { id: 'ie3bFiVatHT', label: 'Handwashing condition (1–5)', type: 'INTEGER_POSITIVE' },
    { id: 'Y6DQqwTdhiZ', label: 'Library available?', type: 'BOOLEAN' },
    { id: 'IAomDvMcUDr', label: 'Library condition (1–5)', type: 'NUMBER' },
    { id: 'ya5SyA5hej4', label: 'Number of classrooms', type: 'NUMBER' },
    { id: 'XIgpDhDC4Ol', label: 'Number of clean and secure classrooms', type: 'NUMBER' },
    { id: 'XThfmg6f2oC', label: 'Playground available?', type: 'BOOLEAN' },
    { id: 'JzZfwXtdL6G', label: 'Playground condition (1–5)', type: 'INTEGER_POSITIVE' },
    { id: 'I13NTyLrHBm', label: 'Toilets for teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'QXcKg7GSr4e', label: 'Toilets for boys', type: 'NUMBER' },
    { id: 'OGmIo4kFUYr', label: 'Toilets for girls', type: 'NUMBER' },
    { id: 'iytoDmoTUWY', label: 'Total toilets', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'DO0LBJfXY00', label: 'Learners (students)', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'jcC1uz56IpY', label: 'Number of seats', type: 'INTEGER_ZERO_OR_POSITIVE' },
    { id: 'LME331J5aev', label: 'Number of teachers', type: 'INTEGER_ZERO_OR_POSITIVE' },
]

export default function SchoolInspectionForm({ orgUnitId }) {
    const [formState, setFormState] = useState({})
    const [submitInspection, { loading, error }] = usePostSchoolInspectionEvent()

    const handleChange = (id, value) => {
        setFormState({ ...formState, [id]: value })
    }

    const handleSubmit = async () => {
        const dataValues = schoolInspectionFields.map(({ id, type }) => {
            let value = formState[id]
            if (type === 'BOOLEAN') {
                value = value === undefined || value === '' ? false : value
            } else {
                value = value === undefined || value === '' ? 0 : value
            }
            return {
                dataElement: id,
                value,
            }
        })

        await submitInspection({ orgUnit_id: orgUnitId, dataValues })
        alert('Event submitted!')
    }

    return (
        <div style={{ marginTop: '1rem' }}>
            <h3>School Inspection – Form</h3>

            {loading && <CircularLoader small />}

            {!loading && (
                <>
                    {schoolInspectionFields.map(({ id, label, type }) => (
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
                                    value={formState[id] || ''}
                                    onChange={({ value }) => handleChange(id, value)}
                                />
                            )}
                        </div>
                    ))}

                    <Button primary onClick={handleSubmit} disabled={loading}>
                        Submit Inspection
                    </Button>

                    {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
                </>
            )}
        </div>
    )
}
