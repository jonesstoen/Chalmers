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

    // Rating scale labels for better understanding
    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {label && (
                <label style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: disabled ? '#94a3b8' : '#0f172a',
                    marginBottom: 4,
                    display: 'block',
                }}>
                    {label}
                    {error && <span style={{ color: '#b91c1c', marginLeft: 4 }}>*</span>}
                </label>
            )}

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    opacity: disabled ? 0.5 : 1,
                    pointerEvents: disabled ? 'none' : 'auto',
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    gap: 8,
                    flexWrap: 'wrap',
                }}>
                    {options.map(num => {
                        const isActive = numericValue === num
                        return (
                            <button
                                key={num}
                                type="button"
                                onClick={() => onChange(num)}
                                onMouseEnter={(e) => {
                                    if (!isActive && !disabled) {
                                        e.currentTarget.style.transform = 'scale(1.1)'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                    e.currentTarget.style.boxShadow = isActive 
                                        ? '0 2px 4px rgba(37, 99, 235, 0.2)' 
                                        : '0 1px 2px rgba(0, 0, 0, 0.1)'
                                }}
                                style={{
                                    width: 44, // Minimum touch target
                                    height: 44,
                                    borderRadius: '8px',
                                    border: isActive
                                        ? '2px solid #2563eb'
                                        : '2px solid #cbd5e1',
                                    background: isActive ? '#2563eb' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#0f172a',
                                    fontSize: 16,
                                    fontWeight: isActive ? 600 : 500,
                                    lineHeight: '1',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isActive 
                                        ? '0 2px 4px rgba(37, 99, 235, 0.2)' 
                                        : '0 1px 2px rgba(0, 0, 0, 0.1)',
                                }}
                                aria-label={`Rating ${num}: ${ratingLabels[num]}`}
                                aria-pressed={isActive}
                            >
                                {num}
                            </button>
                        )
                    })}
                </div>
                
                {/* Show current rating label if selected */}
                {numericValue && !disabled && (
                    <div style={{
                        fontSize: 12,
                        color: '#2563eb',
                        fontWeight: 500,
                        padding: '4px 8px',
                        background: '#eff6ff',
                        borderRadius: 4,
                        display: 'inline-block',
                        alignSelf: 'flex-start',
                    }}>
                        {ratingLabels[numericValue]}
                    </div>
                )}
            </div>

            {error && (
                <p
                    style={{
                        margin: 0,
                        fontSize: 12,
                        color: '#b91c1c',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}
                    role="alert"
                >
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    )
}