// features/inspections/components/BooleanChoiceField.jsx
import React from 'react'

export default function BooleanChoiceField({
                                               label,
                                               value,
                                               onChange,
                                               error,
                                               trueLabel = 'Yes',
                                               falseLabel = 'No',
                                           }) {
    const normalized =
        value === true || value === 'true'
            ? true
            : value === false || value === 'false'
                ? false
                : null

    const isTrue = normalized === true
    const isFalse = normalized === false

    const base = {
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 13,
        lineHeight: '1',
        cursor: 'pointer',
        minWidth: 80,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
    }

    const trueStyle = isActive => ({
        ...base,
        border: isActive ? '2px solid #16a34a' : '1px solid #bbf7d0',
        background: isActive ? '#16a34a' : '#ecfdf3',
        color: isActive ? '#ffffff' : '#14532d',
    })

    const falseStyle = isActive => ({
        ...base,
        border: isActive ? '2px solid #dc2626' : '1px solid #fecaca',
        background: isActive ? '#dc2626' : '#fef2f2',
        color: isActive ? '#ffffff' : '#7f1d1d',
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {label && (
                <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                    {label}
                </span>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    style={trueStyle(isTrue)}
                >
                    {trueLabel}
                </button>
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    style={falseStyle(isFalse)}
                >
                    {falseLabel}
                </button>
            </div>

            {error && (
                <p
                    style={{
                        margin: 0,
                        fontSize: 12,
                        color: '#b91c1c',
                    }}
                >
                    {error}
                </p>
            )}
        </div>
    )
}