import React, { useContext } from "react"
import { useProcessedRatios } from "./useProcessedRatios"
import { useLocalRatios } from "./useLocalRatios"
import InspectionContext from "../../../../context/InspectionContext"
import RatioCard from "./RatioCard"
import { FullHeatmapLegend } from "../components/FullHeatmapLegend"

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

    const columnStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
    }

    const cardWrapperStyle = { width: "120px", height: "120px" }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                <FullHeatmapLegend />
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "2rem",
                    paddingTop: "1rem",
                    justifyItems: "center",
                }}
            >
                {/* MOST RECENT REMOTE */}
                <div style={columnStyle}>
                    <h4>Most Recent Inspection</h4>

                    {RATIO_KEYS.map(({ key, label }) => (
                        <div key={key} style={cardWrapperStyle}>
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
                <div style={columnStyle}>
                    <h4>
                        {usingFallback
                            ? "Change Since Previous Inspection"
                            : "Change Since Last Time"}
                    </h4>

                    {RATIO_KEYS.map(({ key, threshold }) => {
                        const prev = remoteData?.ratios[key]
                        const curr = localData?.ratios[key]

                        if (isNaN(prev) || isNaN(curr))
                            return <div key={key} style={cardWrapperStyle}>N/A</div>

                        const percent = ((curr - prev) / prev) * 100
                        const sign = percent >= 0 ? "+" : ""
                        const good = threshold(curr)

                        return (
                            <div
                                key={key}
                                style={{
                                    ...cardWrapperStyle,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    color: good ? "green" : "red",
                                }}
                            >
                                {sign}{percent.toFixed(0)}%
                            </div>
                        )
                    })}
                </div>

                {/* LOCAL OR FALLBACK */}
                <div style={columnStyle}>
                    <h4>{hasLocalSubmission ? "Just Submitted" : "Previous Inspection"}</h4>

                    {RATIO_KEYS.map(({ key, label }) => (
                        <div key={key} style={cardWrapperStyle}>
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
