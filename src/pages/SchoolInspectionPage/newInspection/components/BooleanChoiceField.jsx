// pages/SchoolInspectionPage/newInspection/components/BooleanChoiceField.jsx
import React from 'react'
import { IconError16, IconWarning16 } from '@dhis2/ui'
import styles from './BooleanChoiceField.module.css'

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

    return (
        <div className={styles.container}>
            {label && (
                <label className={styles.label}>
                    <span>{label}</span>
                    {hasChanged && (
                        <span className={`${styles.badge} ${styles.badgeModified}`}>
                            <IconWarning16 />
                            Modified
                        </span>
                    )}
                    {error && (
                        <span className={`${styles.badge} ${styles.badgeError}`}>
                            <IconError16 />
                            Required
                        </span>
                    )}
                </label>
            )}

            <div className={styles.buttonContainer}>
                <button
                    type="button"
                    onClick={() => {
                        // Toggle: if already true, set to null (unselect)
                        onChange(isTrue ? null : true)
                    }}
                    className={`${styles.buttonBase} ${styles.buttonTrue} ${isTrue ? styles.buttonTrueActive : ''}`}
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
                    className={`${styles.buttonBase} ${styles.buttonFalse} ${isFalse ? styles.buttonFalseActive : ''}`}
                    aria-pressed={isFalse}
                    aria-label={`${label}: ${falseLabel}`}
                >
                    {falseLabel}
                </button>
            </div>

            <p
                className={`${styles.errorMessage} ${error ? '' : styles.errorMessageHidden}`}
                role={error ? 'alert' : undefined}
                aria-hidden={error ? undefined : true}
            >
                <IconError16 />
                <span>{error || '\u00A0'}</span>
            </p>
        </div>
    )
}