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
    seatsToLearner: true,
    learnerToClassroom: true,
    learnerToTeacher: true,
    learnerToToilet: true,
}

// function smoothColor(value, thresholdValue, goodWhenLower = true) {
//   if (value == null || isNaN(value)) return "hsl(0, 0%, 88%)";

//   // Your exact gradient stops: red (0) → gray (0.5) → green (1)
//   const stops = [
//     { pos: 0, h: 0, s: 70, l: 47 },   // Full red (worst/high)
//     { pos: 0.5, h: 0, s: 0, l: 88 },  // Gray (threshold/ideal)
//     { pos: 1, h: 120, s: 70, l: 47 }  // Full green (best/low)
//   ];

//   // Normalize deviation from threshold (-1 = 2x over, +1 = 0 value, 0 = at threshold)
//   const normalizedDev = goodWhenLower
//     ? (thresholdValue - value) / thresholdValue
//     : (value - thresholdValue) / thresholdValue;

//   // Map to pos [0,1]: threshold=0.5, better=1 (green), worse=0 (red)
//   let pos = 0.5 + 0.5 * normalizedDev;
//   pos = Math.max(0, Math.min(1, pos));  // Clamp extremes to full color

//   // Interpolate HSL at pos
//   let h, s, l;
//   if (pos <= stops[0].pos) {
//     // Full red
//     return `hsl(0, 70%, 47%)`;
//   } else if (pos >= stops[2].pos) {
//     // Full green
//     return `hsl(120, 70%, 47%)`;
//   }

//   // Lerp between stops
//   for (let i = 0; i < stops.length - 1; i++) {
//     if (stops[i].pos <= pos && pos <= stops[i + 1].pos) {
//       const t = (pos - stops[i].pos) / (stops[i + 1].pos - stops[i].pos);
//       h = stops[i].h + t * (stops[i + 1].h - stops[i].h);
//       s = stops[i].s + t * (stops[i + 1].s - stops[i + 1].s);
//       l = stops[i].l + t * (stops[i + 1].l - stops[i + 1].l);
//       break;
//     }
//   }

//   return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
// }


function smoothColor(value, thresholdValue, goodWhenLower = true) {
  // If goodWhenLower is false, invert the ratio so "good" means higher values.
  let perc = value / thresholdValue;
  if (!goodWhenLower) perc = 1 / Math.max(1e-9, perc); // avoid div-by-zero

  return percentageToColor(perc);
}

function percentageToColor(percentage) {
  // allowed domain:
  const maxCap = 1.5;
  percentage = Math.max(0, Math.min(maxCap, percentage));

  // If percentage <= 1: GREEN (at 0) -> GREY (at 1)
  if (percentage <= 1) {
    const t = Math.pow(percentage, 4); // adjust exponent to tune curve
    // Hue moves from green (120) toward 0, but saturation goes 70% -> 0%,
    // lightness goes 47% -> 88% so final is desaturated grey.
    const hue = 120 * (1 - t);           // 120 -> 0 (optional, mostly ignored when sat=0)
    const saturation = 70 * (1 - t);     // 70% -> 0%
    const lightness = 47 + (88 - 47) * t; // 47% -> 88%
    return `hsl(${Math.round(hue)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
  }

  // If percentage > 1: GREY (at 1) -> RED (at maxCap)
  const t2 = (percentage - 1) / (maxCap - 1); // 0 -> 1 as percentage goes 1 -> maxCap
  const hue = 0;                             // red
  const saturation = 0 + 70 * t2;            // 0% -> 70%
  const lightness = 88 + (47 - 88) * t2;     // 88% -> 47%
  return `hsl(${hue}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
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


                    // Calculate change
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
