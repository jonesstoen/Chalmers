// features/inspections/components/BooleanChoiceField.jsx
import React from 'react'

export default function BooleanChoiceField({
                                               label,
                                               value,
                                               onChange,
                                               error,
                                               trueLabel = 'Yes',
                                               falseLabel = 'No',
                                               hasChanged = false,
                                           }) {
    const normalized =
        value === true || value === 'true'
            ? true
            : value === false || value === 'false'
                ? false
                : null

    const isTrue = normalized === true
    const isFalse = normalized === false

    // Mobile-first: Larger touch targets (min 44x44px for accessibility)
    const base = {
        padding: '10px 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '1.4',
        cursor: 'pointer',
        minWidth: 100,
        minHeight: 44, // Minimum touch target size
        transition: 'all 0.2s ease',
        border: '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }

    const trueStyle = isActive => ({
        ...base,
        border: isActive ? '2px solid #16a34a' : '2px solid #86efac',
        background: isActive ? '#16a34a' : '#ecfdf3',
        color: isActive ? '#ffffff' : '#14532d',
        boxShadow: isActive 
            ? '0 2px 4px rgba(22, 163, 74, 0.2)' 
            : '0 1px 2px rgba(0, 0, 0, 0.05)',
    })

    const falseStyle = isActive => ({
        ...base,
        border: isActive ? '2px solid #dc2626' : '2px solid #fca5a5',
        background: isActive ? '#dc2626' : '#fef2f2',
        color: isActive ? '#ffffff' : '#7f1d1d',
        boxShadow: isActive 
            ? '0 2px 4px rgba(220, 38, 38, 0.2)' 
            : '0 1px 2px rgba(0, 0, 0, 0.05)',
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {label && (
                <label style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#0f172a',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <span>{label}</span>
                    {hasChanged && (
                        <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#d97706',
                            background: '#fef3c7',
                            padding: '2px 6px',
                            borderRadius: 4,
                        }}>
                            Changed
                        </span>
                    )}
                    {error && <span style={{ color: '#b91c1c', marginLeft: 4 }}>*</span>}
                </label>
            )}

            <div style={{ 
                display: 'flex', 
                gap: 12,
                width: '100%',
            }}>
                <button
                    type="button"
                    onClick={() => {
                        // Toggle: if already true, set to null (unselect)
                        onChange(isTrue ? null : true)
                    }}
                    onMouseEnter={(e) => {
                        if (!isTrue) {
                            e.currentTarget.style.transform = 'scale(1.02)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                    }}
                    style={trueStyle(isTrue)}
                    aria-pressed={isTrue}
                    aria-label={`${label}: ${trueLabel}`}
                >
                    {trueLabel}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        // Toggle: if already false, set to null (unselect)
                        onChange(isFalse ? null : false)
                    }}
                    onMouseEnter={(e) => {
                        if (!isFalse) {
                            e.currentTarget.style.transform = 'scale(1.02)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                    }}
                    style={falseStyle(isFalse)}
                    aria-pressed={isFalse}
                    aria-label={`${label}: ${falseLabel}`}
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