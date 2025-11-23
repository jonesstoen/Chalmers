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
    <div className={styles.pageContainer}>
      {/* Key Ratios Section - Prominent at top */}
      <section className={styles.ratiosSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainTitle}>Key Performance Ratios</h2>
          <p className={styles.mainDescription}>
            Critical ratios that indicate school capacity and resource adequacy
          </p>
        </div>
        <div className={styles.ratiosContainer}>
          <HeatmapComparison schoolId={OrgId} />
        </div>
      </section>

      {/* Detailed Metrics - Organized by Category */}
      <section className={styles.metricsSection}>
        <h2 className={styles.metricsTitle}>Detailed Metrics Over Time</h2>
        
        {/* Capacity Metrics */}
        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>Capacity & Resources</h3>
          <p className={styles.categoryDescription}>
            Classrooms, learners, seats, and teaching staff
          </p>
          <div className={styles.metricsGrid}>
            {organizedFields.capacity.map((field) => (
              <GraphCard
                key={field.id}
                schoolId={OrgId}
                dataElement={field.id}
                localPoints={getLocalPoints(field.id)}
              />
            ))}
          </div>
        </div>

        {/* Sanitation Metrics */}
        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>Sanitation Facilities</h3>
          <p className={styles.categoryDescription}>
            Toilet facilities for teachers, boys, and girls
          </p>
          <div className={styles.metricsGrid}>
            {organizedFields.sanitation.map((field) => (
              <GraphCard
                key={field.id}
                schoolId={OrgId}
                dataElement={field.id}
                localPoints={getLocalPoints(field.id)}
              />
            ))}
            {results.length > 0 && submittedMap[SANITATION_IDS[0]] && (
              <GraphCard
                key={TOTAL_TOILETS_ID}
                schoolId={OrgId}
                dataElement={TOTAL_TOILETS_ID}
                localPoints={getLocalPoints(TOTAL_TOILETS_ID)}
              />
            )}
          </div>
        </div>

        {/* Facilities Metrics */}
        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>Facilities & Condition</h3>
          <p className={styles.categoryDescription}>
            Availability and condition of school facilities
          </p>
          <div className={styles.metricsGrid}>
            {organizedFields.facilities.map((field) => (
              <GraphCard
                key={field.id}
                schoolId={OrgId}
                dataElement={field.id}
                localPoints={getLocalPoints(field.id)}
              />
            ))}
          </div>
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
      <h4 className={styles.graphCardTitle}>{name}</h4>
      <div className={styles.graphCardContent}>
        <SchoolGraph
          schoolId={schoolId}
          dataElements={[dataElement]}
          label={name}
          localPoints={localPoints}
        />
      </div>
    </div>
  )
}

export default Result
