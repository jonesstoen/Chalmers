import React, { useState } from "react"
import ModernTooltip from "../components/ModernTooltip"
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

export default function RatioCard({ ratioKey, label, value, totals }) {
    const [hover, setHover] = useState(false)

    const t = {
        seatsToLearner: { num: totals.learners, den: totals.seats, denLabel: "Seats" },
        learnerToClassroom: { num: totals.learners, den: totals.classrooms, denLabel: "Classrooms" },
        learnerToTeacher: { num: totals.learners, den: totals.teachers, denLabel: "Teachers" },
        learnerToToilet: { num: totals.learners, den: totals.toilets, denLabel: "Toilets" },
    }[ratioKey]

    const tooltipText = `${label}
Learners: ${t.num ?? "–"}
${t.denLabel}: ${t.den ?? "–"}
Ratio: ${isNaN(value) ? "N/A" : value.toFixed(2)}
`

    const thresholdValue = mapThreshold[ratioKey]
    const goodLower = goodWhenLower[ratioKey]

    const bg = smoothColor(value, thresholdValue, goodLower)

    return (
        <div className={styles.container}>
            <ModernTooltip visible={hover} text={tooltipText} />

            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={styles.card}
                style={{ background: bg }}
            >
                <div className={styles.label}>
                    {label}
                </div>

                <div className={styles.value}>
                    {isNaN(value) ? "N/A" : value.toFixed(2)}
                </div>
            </div>
        </div>
    )
}

function smoothColor(value, thresholdValue, goodWhenLower) {
    if (value == null || isNaN(value)) return "hsl(0, 0%, 82%)"

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
