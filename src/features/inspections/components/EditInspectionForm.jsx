// features/inspections/components/EditInspectionForm.jsx
import React, { useEffect, useState } from 'react'
import { Button, InputField, CheckboxField, NoticeBox } from '@dhis2/ui'
// ⬇️ RIKTIG import
import { useUpdateSchoolInspectionEvent } from '../hooks/useUpdateSchoolInspection'

// Samme feltliste som i submit-formen
const FIELDS = [
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

export default function EditInspectionForm({ event }) {
    const [form, setForm] = useState({})
    const [updateEvent, { loading, error }] = useUpdateSchoolInspectionEvent()

    useEffect(() => {
        if (!event) return
        const next = {}
        for (const f of FIELDS) {
            const v = event[f.id]
            next[f.id] = v === undefined || v === null ? '' : v
        }
        setForm(next)
    }, [event])

    if (!event) {
        return <NoticeBox title="Select an event">Pick an event in the table above to edit.</NoticeBox>
    }

    const handleChange = (id, value) => setForm(prev => ({ ...prev, [id]: value }))

    const handleSubmit = async () => {
        const dataValues = FIELDS.map(({ id, type }) => {
            let value = form[id]
            if (type === 'BOOLEAN') value = !!value
            return { dataElement: id, value }
        })
        await updateEvent({ eventId: event.psi, dataValues })
        alert('Event updated!')
    }

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
            <h3>Edit inspection</h3>
            <p style={{ marginTop: 0, color: '#475569' }}><strong>Event ID:</strong> {event.psi}</p>

            {FIELDS.map(({ id, label, type }) => (
                <div key={id} style={{ marginBottom: '0.75rem' }}>
                    {type === 'BOOLEAN' ? (
                        <CheckboxField
                            label={label}
                            checked={form[id] === true || form[id] === 'true'}
                            onChange={() => handleChange(id, !(form[id] === true || form[id] === 'true'))}
                        />
                    ) : (
                        <InputField
                            label={label}
                            type="number"
                            value={String(form[id] ?? '')}
                            onChange={({ value }) => handleChange(id, value)}
                        />
                    )}
                </div>
            ))}

            <Button primary onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
            </Button>

            {error && <p style={{ color: 'crimson' }}>Error: {error.message}</p>}
        </div>
    )
}