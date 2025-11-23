// pages/SchoolInspectionPage/history/heatmap/AggregatedHeatmap.jsx
import React from "react"
import RatioCard from "./RatioCard"
import { FullHeatmapLegend } from "../components/FullHeatmapLegend"

// Same ratio config as school-level:
const RATIO_KEYS = [
  { key: "seatsToLearner", label: "Learners / Seat", threshold: v => v <= 1 },
  { key: "learnerToClassroom", label: "Learners / Classroom", threshold: v => v <= 53 },
  { key: "learnerToTeacher", label: "Learners / Teacher", threshold: v => v <= 45 },
  { key: "learnerToToilet", label: "Learners / Toilet", threshold: v => v <= 25 },
]

export default function AggregatedHeatmap({ ratios, totals }) {
  if (!ratios) return null

  return (
    <div style={{ margin: "2rem 0" }}>
      {/* Legend */}
      <FullHeatmapLegend />

      <h3
        style={{
          textAlign: "center",
          marginBottom: "1.2rem",
          marginTop: "1.5rem",
        }}
      >
        Cluster Heatmap (Aggregated Ratios)
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
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
