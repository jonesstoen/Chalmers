import React, { useContext } from "react"
import { useProcessedRatios } from "./useProcessedRatios"
import { useLocalRatios } from "./useLocalRatios"
import InspectionContext from "../../../../context/InspectionContext"
import { FullHeatmapLegend } from "../components/FullHeatmapLegend"
import styles from './HeatmapComparison.module.css'
import smoothColor from "./color"

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
    seatsToLearner: true,
    learnerToClassroom: true,
    learnerToTeacher: true,
    learnerToToilet: true,
}


export default function HeatmapComparison({ schoolId }) {
    const [inspectionDict] = useContext(InspectionContext)

    // inspection history
    const { processedData: remoteDataArray, loading, error } =
        useProcessedRatios(schoolId)

    // Local user-entered form submission
    const localSubmission = inspectionDict?.[schoolId]?.reduce((acc, curr) => {
        acc[curr.dataElement] = Number(curr.value)
        return acc
    }, {})

    const localDataArray = useLocalRatios(localSubmission)

    const comparison_array = remoteDataArray.slice(-2)

    if (localDataArray) comparison_array.push(localDataArray[0])
    
    const hasRemoteSub = remoteDataArray?.length > 0
    const hasLocalSubmission = localDataArray?.length > 0

    const prev = comparison_array[comparison_array.length - 2]
    const curr = comparison_array[comparison_array.length - 1]


    if (loading) return <p>Loading ratios…</p>
    if (error) return <p>Error: {error.message}</p>
    if (!hasRemoteSub) return <p>No remote data available</p>


    return (
        <>
            <div className={styles.legendContainer}>
                <FullHeatmapLegend />
            </div>

            <div className={styles.ratiosContainer}>
                {RATIO_KEYS.map(({ key, label, _ }) => {
                    const prevRatio = prev?.ratios[key]
                    const currRatio = curr?.ratios[key]


                    // calculate change
                    let percentChange = null
                    let absoluteChange = null
                    if (!isNaN(prevRatio) && !isNaN(currRatio) && prevRatio != null && currRatio != null) {
                        percentChange = ((currRatio - prevRatio) / prevRatio) * 100
                        absoluteChange = currRatio - prevRatio
                    }

                    const thresholdValue = mapThreshold[key]
                    const goodLower = goodWhenLower[key]

                    const prevColor = smoothColor(prevRatio, thresholdValue, goodLower)
                    const currColor = smoothColor(currRatio, thresholdValue, goodLower)

                    return (
                        <div key={key} className={styles.ratioRow}>
                            <div className={styles.ratioLabel}>{label}</div>
                            <div className={styles.ratioValues}>
                                {/*   Previous */}
                                <div 
                                    className={styles.valueSection}
                                    style={{ background: prevColor }}
                                >
                                    <div className={styles.sectionLabel}>Previous</div>
                                    <div className={styles.sectionValue}>
                                        {isNaN(prevRatio) || prevRatio == null ? "N/A" : prevRatio.toFixed(1)}
                                    </div>
                                </div>

                                {/* Change */}
                                <div className={styles.valueSection}>
                                    <div className={styles.sectionLabel}>
                                        {"Change"}
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

                                {/*Most Recent remote / Just Submitted */}
                                <div 
                                    className={styles.valueSection}
                                    style={{ background: currColor }}
                                >
                                    <div className={styles.sectionLabel}>
                                        {hasLocalSubmission ? "Just Submitted" : "Most Recent"}
                                    </div>
                                    <div className={styles.sectionValue}>
                                        {isNaN(currRatio) || currRatio == null ? "N/A" : currRatio.toFixed(1)}
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
