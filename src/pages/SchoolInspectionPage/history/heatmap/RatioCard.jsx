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

function smoothColor(value, thresholdValue, goodWhenLower) {
    if (value == null || isNaN(value)) return "hsl(0, 0%, 88%)"

    let diff = goodWhenLower
        ? value / thresholdValue
        : Math.abs(value - thresholdValue) / thresholdValue

    diff = Math.min(diff, 1)

    if (diff < 0.10) return "hsl(0, 0%, 88%)"

    const isGood = goodWhenLower ? value <= thresholdValue : value >= thresholdValue

    const lightness = 82 - diff * 35
    const saturation = 35 + diff * 35

    return isGood
        ? `hsl(120, ${saturation}%, ${lightness}%)`
        : `hsl(0, ${saturation}%, ${lightness}%)`
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
