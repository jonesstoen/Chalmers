import React, { useContext } from "react"
import { useProcessedRatios } from "./useProcessedRatios"
import { useLocalRatios } from "./useLocalRatios"
import InspectionContext from "../../../../context/InspectionContext"
import { FullHeatmapLegend } from "../components/FullHeatmapLegend"
import styles from './HeatmapComparison.module.css'

const RATIO_KEYS = [
  { key: "seatsToLearner", label: "Learners / Seat", threshold: v => v <= 1 },
  { key: "learnerToClassroom", label: "Learners / Classroom", threshold: v => v <= 53 },
  { key: "learnerToTeacher", label: "Learners / Teacher", threshold: v => v <= 45 },
  { key: "learnerToToilet", label: "Learners / Toilet", threshold: v => v <= 25 },
]

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

// -----------------------------------------
// ALWAYS use totals from source.totals
// -----------------------------------------
function extractTotals(source) {
    if (!source) return null;

    // This is the ACTUAL structure based on your debug log
    return {
        learners: Number(source.learners ?? 0),
        seats: Number(source.seats ?? 0),
        classrooms: Number(source.classrooms ?? 0),
        teachers: Number(source.teachers ?? 0),
        toilets: Number(source.toilets ?? 0),
    };
}

export default function HeatmapComparison({ schoolId }) {
    const [inspectionDict] = useContext(InspectionContext)

    // REMOTE inspection history
    const { processedData: remoteDataArray, loading, error } =
        useProcessedRatios(schoolId)

    // Local user-entered form submission
    const localSubmission = inspectionDict?.[schoolId]?.reduce((acc, curr) => {
        acc[curr.dataElement] = Number(curr.value)
        return acc
    }, {})

    const localDataArray = useLocalRatios(localSubmission)

    const remoteData =
        remoteDataArray?.length > 0
            ? remoteDataArray[remoteDataArray.length - 1]
            : null

    const secondLatestRemote =
        remoteDataArray?.length > 1
            ? remoteDataArray[remoteDataArray.length - 2]
            : null

    const localData =
        localDataArray?.length > 0 ? localDataArray[0] : secondLatestRemote

    if (loading) return <p>Loading ratios…</p>
    if (error) return <p>Error: {error.message}</p>
    if (!remoteData) return <p>No remote data available</p>

    // ---- TOTALS are guaranteed correct here ----
    const remoteTotals = extractTotals(remoteData)
    const localTotals = extractTotals(localData)

    const hasLocalSubmission = localDataArray?.length > 0
    const usingFallback = !hasLocalSubmission

    return (
        <>
            <div className={styles.legendContainer}>
                <FullHeatmapLegend />
            </div>

            <div className={styles.ratiosContainer}>
                {RATIO_KEYS.map(({ key, label, threshold }) => {
                    const prevValue = remoteData?.ratios[key]
                    const currValue = localData?.ratios[key]
                    
                    // Calculate change
                    let percentChange = null
                    let absoluteChange = null
                    if (!isNaN(prevValue) && !isNaN(currValue) && prevValue != null && currValue != null) {
                        percentChange = ((currValue - prevValue) / prevValue) * 100
                        absoluteChange = currValue - prevValue
                    }

                    const thresholdValue = mapThreshold[key]
                    const goodLower = goodWhenLower[key]

                    const prevColor = smoothColor(prevValue, thresholdValue, goodLower)
                    const currColor = smoothColor(currValue, thresholdValue, goodLower)

                    return (
                        <div key={key} className={styles.ratioRow}>
                            <div className={styles.ratioLabel}>{label}</div>
                            <div className={styles.ratioValues}>
                                {/* Most Recent */}
                                <div 
                                    className={styles.valueSection}
                                    style={{ background: prevColor }}
                                >
                                    <div className={styles.sectionLabel}>Most Recent</div>
                                    <div className={styles.sectionValue}>
                                        {isNaN(prevValue) || prevValue == null ? "N/A" : prevValue.toFixed(1)}
                                    </div>
                                </div>

                                {/* Change */}
                                <div className={styles.valueSection}>
                                    <div className={styles.sectionLabel}>
                                        {usingFallback
                                            ? "Change Since Previous"
                                            : "Change Since Last"}
                                    </div>
                                    <div className={styles.sectionValue}>
                                        {percentChange != null ? (
                                            <>
                                                <span className={styles.changePercent}>
                                                    {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(0)}%
                                                </span>
                                                <span className={styles.changeAbsolute}>
                                                    ({absoluteChange >= 0 ? "+" : ""}{absoluteChange.toFixed(1)})
                                                </span>
                                            </>
                                        ) : (
                                            "N/A"
                                        )}
                                    </div>
                                </div>

                                {/* Previous / Just Submitted */}
                                <div 
                                    className={styles.valueSection}
                                    style={{ background: currColor }}
                                >
                                    <div className={styles.sectionLabel}>
                                        {hasLocalSubmission ? "Just Submitted" : "Previous"}
                                    </div>
                                    <div className={styles.sectionValue}>
                                        {isNaN(currValue) || currValue == null ? "N/A" : currValue.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
