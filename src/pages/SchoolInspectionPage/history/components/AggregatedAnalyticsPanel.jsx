// pages/SchoolInspectionPage/history/components/AggregatedAnalyticsPanel.jsx
import ClusterGraph from "../graphs/ClusterGraph"
import AggregatedHeatmap from "../heatmap/AggregatedHeatmap.jsx"
import { CAPACITY_IDS, SANITATION_IDS, TOTAL_TOILETS_ID } from "../../newInspection/configs/schoolInspectionConfig"
import { dataElementIdToDescription } from "../../newInspection/configs/inspectionFormUtils"
import { useAggregatedSchoolAnalytics } from "../hooks/useAggregatedSchoolAnalytics"
import styles from './AggregatedAnalyticsPanel.module.css'

// ------------------- GRAPH CARD --------------------
function GraphCard({ OrgId, dataElementId }) {
    const label = dataElementIdToDescription(dataElementId)
    return (
        <div className={styles.graphCard}>
            <h3 className={styles.graphCardTitle}>
                {label}
            </h3>

            <div className={styles.graphContainer}>
                <ClusterGraph
                    schoolId={OrgId}
                    dataElements={[dataElementId]}
                    label={label}
                />
            </div>
        </div>
    )
}

// ------------------- SINGLE-ID VALUE HELPER --------------------
function getLatestValue(series) {
    if (!series?.length) return null
    const last = series[series.length - 1]
    return Number(last.value ?? 0)
}

// ------------------- MAIN PANEL --------------------
export default function AggregatedAnalyticsPanel({ data }) {
    const QUANT_IDS = [...CAPACITY_IDS, ...SANITATION_IDS, TOTAL_TOILETS_ID]

    const OID = data?.ou?.id ?? null
    const name = data?.ou?.displayName || data?.ou?.name

    // Fetch each required indicator SEPARATELY (100% reliable)
    const learners = useAggregatedSchoolAnalytics({
        schoolId: OID,
        dataElementIds: ["DO0LBJfXY00"],
        startDate: "2024-01-01",
        endDate: new Date().toISOString().split("T")[0],
    })

    const seats = useAggregatedSchoolAnalytics({
        schoolId: OID,
        dataElementIds: ["jcC1uz56IpY"],
        startDate: "2024-01-01",
        endDate: new Date().toISOString().split("T")[0],
    })

    const classrooms = useAggregatedSchoolAnalytics({
        schoolId: OID,
        dataElementIds: ["ya5SyA5hej4"],
        startDate: "2024-01-01",
        endDate: new Date().toISOString().split("T")[0],
    })

    const teachers = useAggregatedSchoolAnalytics({
        schoolId: OID,
        dataElementIds: ["LME331J5aev"],
        startDate: "2024-01-01",
        endDate: new Date().toISOString().split("T")[0],
    })

    const toilets = useAggregatedSchoolAnalytics({
        schoolId: OID,
        dataElementIds: ["iytoDmoTUWY"],
        startDate: "2024-01-01",
        endDate: new Date().toISOString().split("T")[0],
    })

    // Handle loading/error states
    if (learners.loading || seats.loading || classrooms.loading || teachers.loading || toilets.loading)
        return <p>Loading aggregated analytics…</p>

    if (learners.error || seats.error || classrooms.error || teachers.error || toilets.error)
        return <p>Error loading cluster analytics.</p>

    // Extract latest values for each metric
    const L = getLatestValue(learners.timeSeries)
    const S = getLatestValue(seats.timeSeries)
    const C = getLatestValue(classrooms.timeSeries)
    const T = getLatestValue(teachers.timeSeries)
    const TT = getLatestValue(toilets.timeSeries)

    // Build ratio object
    const aggregatedRatios = {
        seatsToLearner: S > 0 ? L / S : null,
        learnerToClassroom: C > 0 ? L / C : null,
        learnerToTeacher: T > 0 ? L / T : null,
        learnerToToilet: TT > 0 ? L / TT : null,
    }

    return (
        <>
            <h1 className={styles.title}>
                Cluster Analytics – {name}
            </h1>

            <AggregatedHeatmap
                ratios={aggregatedRatios}
                totals={{ learners: L, seats: S, classrooms: C, teachers: T, toilets: TT }}
            />

            <div className={styles.graphsGrid}>
                {QUANT_IDS.map(id => (
                    <GraphCard key={id} OrgId={OID} dataElementId={id} />
                ))}
            </div>
        </>
    )
}
