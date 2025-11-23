import React, { useState } from "react"
import ModernTooltip from "../components/ModernTooltip"

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
        <div style={{ position: "relative", width: "120px" }}>
            <ModernTooltip visible={hover} text={tooltipText} />

            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "0.3rem",
                    background: bg,
                    color: "#111",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    padding: "0.4rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    cursor: "pointer",
                    transition: "background 0.2s ease-in-out",
                }}
            >
                <div style={{ fontSize: "0.85rem", lineHeight: "1.1" }}>
                    {label}
                </div>

                <div style={{
                    fontSize: "1.45rem",
                    fontWeight: "700",
                    marginTop: "0.1rem",
                }}>
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
