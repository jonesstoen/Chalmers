import React, { useContext, useMemo } from "react"
import { useProcessedRatios } from "./useProcessedRatios"
import { useLocalRatios } from "./useLocalRatios"
import InspectionContext from "../../../context/InspectionContext"
import RatioCard from "./RatioCard"

const RATIO_KEYS = [
  { key: 'seatsToLearner', label: 'Learners / Seat', higherIsBetter: false, threshold: v => v <= 1 },
  { key: 'learnerToClassroom', label: 'Learners / Classroom', higherIsBetter: false, threshold: v => v <= 53 },
  { key: 'learnerToTeacher', label: 'Learners / Teacher', higherIsBetter: false, threshold: v => v <= 45 },
  { key: 'learnerToToilet', label: 'Learners / Toilet', higherIsBetter: false, threshold: v => v <= 25 },
]

export default function HeatmapComparison({ schoolId }) {
  const [inspectionDict] = useContext(InspectionContext)
  const localSubmission = inspectionDict?.[schoolId]?.reduce((acc, curr) => {
    acc[curr.dataElement] = Number(curr.value)
    return acc
  }, {})

  const { processedData: remoteDataArray, loading, error } = useProcessedRatios(schoolId)
  const localDataArray = useLocalRatios(localSubmission)

  const remoteData = remoteDataArray?.[remoteDataArray.length - 1] || null
  const localData = localDataArray?.[0] || null

  // Compute % changes (reflecting desirability)
  const changes = useMemo(() => {
    if (!remoteData || !localData) return null
    const result = {}
    RATIO_KEYS.forEach(({ key, higherIsBetter }) => {
      const remote = remoteData.ratios[key]
      const local = localData.ratios[key]
      if (isNaN(remote) || isNaN(local)) {
        result[key] = { value: NaN, good: null }
      } else {
        const rawChange = ((local - remote) / remote) * 100
        const isGood = higherIsBetter ? rawChange >= 0 : rawChange <= 0
        result[key] = { value: Math.abs(rawChange), good: isGood }
      }
    })
    return result
  }, [remoteData, localData])

  if (loading) return <p>Loading ratios…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!remoteData) return <p>No remote data available</p>

  const cardStyle = { width: '120px', height: '120px' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', justifyItems: 'center' }}>
      {/* Remote */}
      <div>
        <h4 style={{ textAlign: 'center' }}>Latest Remote</h4>
        {RATIO_KEYS.map(({ key, label, threshold }) => (
          <div key={key} style={cardStyle}>
            <RatioCard label={label} value={remoteData.ratios[key]} thresholdFn={threshold} />
          </div>
        ))}
      </div>

{/* % Change */}
<div>
  <h4 style={{ textAlign: 'center' }}>Change (%)</h4>
  {RATIO_KEYS.map(({ key, threshold }) => {
    const prev = remoteData?.ratios[key]
    const curr = localData?.ratios[key]

    if (prev == null || curr == null || isNaN(prev) || isNaN(curr)) {
      return <div key={key} style={cardStyle}>N/A</div>
    }

    const percentChange = ((curr - prev) / prev) * 100
    const sign = percentChange >= 0 ? '+' : ''
    const good = threshold(curr) // green if the new ratio is within threshold

    return (
      <div
        key={key}
        style={{
          ...cardStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: good ? 'green' : 'red',
        }}
      >
        {sign}{percentChange.toFixed(0)}%
      </div>
    )
  })}
</div>



      {/* Local */}
      <div>
        <h4 style={{ textAlign: 'center' }}>Just Submitted</h4>
        {RATIO_KEYS.map(({ key, label, threshold }) => (
          <div key={key} style={cardStyle}>
            <RatioCard label={label} value={localData?.ratios[key]} thresholdFn={threshold} />
          </div>
        ))}
      </div>
    </div>
  )
}
