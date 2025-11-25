
import React from 'react'
import { IconError16, IconWarning16 } from '@dhis2/ui'
import styles from './ConditionRatingField.module.css'

export default function ConditionRatingField({label, value, onChange, disabled = false, error, hasChanged = false,}) {
    const options = [1, 2, 3, 4, 5]
    const numericValue =
        value !== undefined && value !== null && value !== ''
            ? Number(value)
            : null

    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    }

    return (
        <div className={styles.container}>
            {label && (
                <label className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}>
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

            <div className={`${styles.fieldContainer} ${disabled ? styles.fieldContainerDisabled : ''}`}>
                <div className={styles.ratingContainer}>
                    {/* Poor label */}
                    <span className={`${styles.ratingLabel} ${styles.ratingLabelLeft}`}>
                        Poor
                    </span>
                    
                    {/* Rating buttons */}
                    <div className={styles.ratingButtons}>
                        {options.map(num => {
                            const isActive = numericValue === num
                            return (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => onChange(num)}
                                    className={`${styles.ratingButton} ${isActive ? styles.ratingButtonActive : ''} ${disabled ? styles.ratingButtonDisabled : ''}`}
                                    aria-label={`Rating ${num}: ${ratingLabels[num]}`}
                                    aria-pressed={isActive}
                                >
                                    {num}
                                </button>
                            )
                        })}
                    </div>

                    <span className={`${styles.ratingLabel} ${styles.ratingLabelRight}`}>
                        Excellent
                    </span>
                </div>
            </div>

        </div>
    )
}