import React from "react"
import RatioCard from "./RatioCard"
import { FullHeatmapLegend } from "../components/FullHeatmapLegend"
import styles from './AggregatedHeatmap.module.css'

const RATIO_KEYS = [
  { key: "seatsToLearner", label: "Learners / Seat", threshold: v => v <= 1 },
  { key: "learnerToClassroom", label: "Learners / Classroom", threshold: v => v <= 53 },
  { key: "learnerToTeacher", label: "Learners / Teacher", threshold: v => v <= 45 },
  { key: "learnerToToilet", label: "Learners / Toilet", threshold: v => v <= 25 },
]

export default function AggregatedHeatmap({ ratios, totals }) {
  if (!ratios) return null

  return (
    <div className={styles.container}>
      {/* Legend */}
      <FullHeatmapLegend />

      <h3 className={styles.title}>
        Cluster Heatmap (Aggregated Ratios)
      </h3>

      <div className={styles.cardsContainer}>
        {RATIO_KEYS.map(({ key, label, threshold }) => (
          <RatioCard
            key={key}
            ratioKey={key}
            label={label}
            value={ratios[key]}
            totals={totals}
          />
        ))}
      </div>
    </div>
  )
}
