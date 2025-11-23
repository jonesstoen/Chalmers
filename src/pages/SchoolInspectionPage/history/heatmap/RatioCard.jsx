import React from "react"
import styles from './RatioCard.module.css'

const mapThreshold = {
    seatsToLearner: 1,
    learnerToClassroom: 53,
    learnerToTeacher: 45,
    learnerToToilet: 25,
}

const goodWhenLower = {
    seatsToLearner: false,
    learnerToClassroom: true,
    learnerToTeacher: true,
    learnerToToilet: true,
}

// Helper to format ratio explanation
function getRatioExplanation(ratioKey, value) {
    if (isNaN(value) || value == null) return ""
    
    const explanations = {
        seatsToLearner: `${value.toFixed(1)} learners per seat`,
        learnerToClassroom: `${value.toFixed(1)} learners per classroom`,
        learnerToTeacher: `${value.toFixed(1)} learners per teacher`,
        learnerToToilet: `${value.toFixed(1)} learners per toilet`,
    }
    
    return explanations[ratioKey] || ""
}

export default function RatioCard({ ratioKey, label, value, totals }) {
    const thresholdValue = mapThreshold[ratioKey]
    const goodLower = goodWhenLower[ratioKey]
    
    const isGood = value != null && !isNaN(value) 
        ? (goodLower ? value <= thresholdValue : value >= thresholdValue)
        : null
    
    const explanation = getRatioExplanation(ratioKey, value)
    const displayValue = isNaN(value) || value == null ? "N/A" : value.toFixed(1)

    return (
        <div className={`${styles.card} ${isGood === true ? styles.cardGood : isGood === false ? styles.cardBad : styles.cardNeutral}`}>
            <div className={styles.label}>{label}</div>
            <div className={styles.value}>{displayValue}</div>
            {explanation && <div className={styles.explanation}>{explanation}</div>}
        </div>
    )
}
