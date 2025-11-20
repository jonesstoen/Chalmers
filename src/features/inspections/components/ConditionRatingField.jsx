// features/inspections/components/ConditionRatingField.jsx
import React from 'react'

export default function ConditionRatingField({
                                                 label,
                                                 value,
                                                 onChange,
                                                 disabled = false,
                                                 error,
                                             }) {
    const options = [1, 2, 3, 4, 5]
    const numericValue =
        value !== undefined && value !== null && value !== ''
            ? Number(value)
            : null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: disabled ? 0.4 : 1,
                    pointerEvents: disabled ? 'none' : 'auto',
                }}
            >
                {label && (
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                        {label}
                    </span>
                )}

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {options.map(num => {
                        const isActive = numericValue === num
                        return (
                            <button
                                key={num}
                                type="button"
                                onClick={() => onChange(num)}
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '999px',
                                    border: isActive
                                        ? '2px solid #2563eb'
                                        : '1px solid #cbd5e1',
                                    background: isActive ? '#2563eb' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#0f172a',
                                    fontSize: 13,
                                    lineHeight: '1',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                {num}
                            </button>
                        )
                    })}
                </div>
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