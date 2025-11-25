import React from "react"
import styles from './RatioCard.module.css'
import smoothColor from "./color"

const mapThreshold = {
    seatsToLearner: 1,
    learnerToClassroom: 53,
    learnerToTeacher: 45,
    learnerToToilet: 25,
}

const goodWhenLower = {
    seatsToLearner: true,
    learnerToClassroom: true,
    learnerToTeacher: true,
    learnerToToilet: true,
}


export default function RatioCard({ ratioKey, label, value, totals }) {
    const thresholdValue = mapThreshold[ratioKey]
    const goodLower = goodWhenLower[ratioKey]
    
    const bgColor = smoothColor(value, thresholdValue, goodLower)
    const displayValue = isNaN(value) || value == null ? "N/A" : value.toFixed(1)

    return (
        <div className={styles.card} style={{ background: bgColor }}>
            <div className={styles.label}>{label}</div>
            <div className={styles.value}>{displayValue}</div>
        </div>
    )
}
