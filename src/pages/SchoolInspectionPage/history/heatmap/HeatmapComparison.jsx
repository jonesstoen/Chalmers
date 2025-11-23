import React, { useContext } from "react"
import { useProcessedRatios } from "./useProcessedRatios"
import { useLocalRatios } from "./useLocalRatios"
import InspectionContext from "../../../../context/InspectionContext"
import RatioCard from "./RatioCard"
import { FullHeatmapLegend } from "../components/FullHeatmapLegend"
import styles from './HeatmapComparison.module.css'

const RATIO_KEYS = [
  { key: "seatsToLearner", label: "Learners / Seat", threshold: v => v <= 1 },
  { key: "learnerToClassroom", label: "Learners / Classroom", threshold: v => v <= 53 },
  { key: "learnerToTeacher", label: "Learners / Teacher", threshold: v => v <= 45 },
  { key: "learnerToToilet", label: "Learners / Toilet", threshold: v => v <= 25 },
]

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
console.log("REMOTE RAW", remoteData);

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

            <div className={styles.grid}>
                {/* MOST RECENT REMOTE */}
                <div className={styles.column}>
                    <h4>Most Recent Inspection</h4>

                    {RATIO_KEYS.map(({ key, label }) => (
                        <div key={key} className={styles.cardWrapper}>
                            <RatioCard
                                ratioKey={key}
                                label={label}
                                value={remoteData?.ratios[key]}
                                totals={remoteTotals}
                            />
                        </div>
                    ))}
                </div>

                {/* CHANGE PERCENT */}
                <div className={styles.column}>
                    <h4>
                        {usingFallback
                            ? "Change Since Previous Inspection"
                            : "Change Since Last Time"}
                    </h4>

                    {RATIO_KEYS.map(({ key, label, threshold }) => {
                        const prev = remoteData?.ratios[key]
                        const curr = localData?.ratios[key]

                        if (isNaN(prev) || isNaN(curr))
                            return (
                                <div key={key} className={styles.changeCard}>
                                    <div className={styles.changeLabel}>{label}</div>
                                    <div className={styles.changeValue}>N/A</div>
                                </div>
                            )

                        const percent = ((curr - prev) / prev) * 100
                        const absoluteChange = curr - prev
                        const sign = percent >= 0 ? "+" : ""
                        const good = threshold(curr)

                        return (
                            <div
                                key={key}
                                className={`${styles.changeCard} ${good ? styles.changeCardGood : styles.changeCardBad}`}
                            >
                                <div className={styles.changeLabel}>{label}</div>
                                <div className={styles.changeValue}>
                                    <span className={styles.changePercent}>{sign}{percent.toFixed(0)}%</span>
                                    <span className={styles.changeAbsolute}>
                                        ({sign}{absoluteChange.toFixed(1)})
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* LOCAL OR FALLBACK */}
                <div className={styles.column}>
                    <h4>{hasLocalSubmission ? "Just Submitted" : "Previous Inspection"}</h4>

                    {RATIO_KEYS.map(({ key, label }) => (
                        <div key={key} className={styles.cardWrapper}>
                            <RatioCard
                                ratioKey={key}
                                label={label}
                                value={localData?.ratios[key]}
                                totals={localTotals}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
