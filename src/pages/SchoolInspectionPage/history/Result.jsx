import { useContext, useMemo } from "react"
import InspectionContext from "../../../context/InspectionContext"
import SchoolGraph from "./graphs/SchoolGraph"
import HeatmapComparison from "./heatmap/HeatmapComparison"
import { dataElementIdToDescription } from "../newInspection/configs/inspectionFormUtils"
import { 
  SCHOOL_INSPECTION_FIELDS, 
  FACILITY_IDS, 
  CAPACITY_IDS, 
  SANITATION_IDS,
  TOTAL_TOILETS_ID 
} from "../newInspection/configs/schoolInspectionConfig"
import styles from './Result.module.css'

function Result({ OrgId }) {
  const [inspectionDict] = useContext(InspectionContext)

  // Last local submission only (one inspection)
  const results = inspectionDict?.[OrgId] ?? []

  const submissionDate = new Date().toLocaleDateString("en-GB")

  // All possible data elements (full form)
  const allDataElements = SCHOOL_INSPECTION_FIELDS.map(f => f.id)

  // Organize data elements by category
  const organizedFields = useMemo(() => {
    const facilities = SCHOOL_INSPECTION_FIELDS.filter(f => FACILITY_IDS.includes(f.id))
    const capacity = SCHOOL_INSPECTION_FIELDS.filter(f => CAPACITY_IDS.includes(f.id))
    const sanitation = SCHOOL_INSPECTION_FIELDS.filter(f => SANITATION_IDS.includes(f.id))
    
    return { facilities, capacity, sanitation }
  }, [])

  // Create a map of submitted data elements for quick lookup
  const submittedMap = useMemo(() => {
    return results.reduce((acc, { dataElement, value }) => {
      acc[dataElement] = {
        label: submissionDate,
        value: Number(value) || 0,
      }
      return acc
    }, {})
  }, [results, submissionDate])

  const getLocalPoints = (dataElement) => {
    if (results.length > 0 && submittedMap[dataElement]) {
      return [submittedMap[dataElement]]
    }
    return []
  }

  return (
    <div className={styles.container}>
      {/* Ratio Comparison Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Key Ratios Comparison</h2>
          <p className={styles.sectionDescription}>
            Compare ratios across inspections to track changes over time
          </p>
        </div>
        <HeatmapComparison schoolId={OrgId} />
      </section>

      {/* Facilities Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Facilities & Condition</h2>
          <p className={styles.sectionDescription}>
            Track availability and condition ratings for school facilities
          </p>
        </div>
        <div className={styles.graphsGrid}>
          {organizedFields.facilities.map((field) => (
            <GraphCard
              key={field.id}
              schoolId={OrgId}
              dataElement={field.id}
              localPoints={getLocalPoints(field.id)}
            />
          ))}
        </div>
      </section>

      {/* Capacity Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Capacity Metrics</h2>
          <p className={styles.sectionDescription}>
            Monitor classroom capacity, learners, seats, and staffing levels
          </p>
        </div>
        <div className={styles.graphsGrid}>
          {organizedFields.capacity.map((field) => (
            <GraphCard
              key={field.id}
              schoolId={OrgId}
              dataElement={field.id}
              localPoints={getLocalPoints(field.id)}
            />
          ))}
        </div>
      </section>

      {/* Sanitation Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sanitation</h2>
          <p className={styles.sectionDescription}>
            Track toilet facilities for teachers, boys, and girls
          </p>
        </div>
        <div className={styles.graphsGrid}>
          {organizedFields.sanitation.map((field) => (
            <GraphCard
              key={field.id}
              schoolId={OrgId}
              dataElement={field.id}
              localPoints={getLocalPoints(field.id)}
            />
          ))}
          {/* Show total toilets if we have any sanitation data */}
          {results.length > 0 && submittedMap[SANITATION_IDS[0]] && (
            <GraphCard
              key={TOTAL_TOILETS_ID}
              schoolId={OrgId}
              dataElement={TOTAL_TOILETS_ID}
              localPoints={getLocalPoints(TOTAL_TOILETS_ID)}
            />
          )}
        </div>
      </section>
    </div>
  )
}

/* ------------------ Graph Card ------------------ */
function GraphCard({ schoolId, dataElement, localPoints }) {
  const name = dataElementIdToDescription(dataElement)

  return (
    <div className={styles.graphCard}>
      <SchoolGraph
        schoolId={schoolId}
        dataElements={[dataElement]}
        label={name}
        localPoints={localPoints}
      />
    </div>
  )
}

export default Result
