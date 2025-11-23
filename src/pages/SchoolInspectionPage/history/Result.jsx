import { useContext } from "react"
import InspectionContext from "../../../context/InspectionContext"
import SchoolGraph from "./graphs/SchoolGraph"
import HeatmapComparison from "./heatmap/HeatmapComparison"
import { dataElementIdToDescription } from "../newInspection/configs/inspectionFormUtils"
import { SCHOOL_INSPECTION_FIELDS } from "../newInspection/configs/schoolInspectionConfig"
import styles from './Result.module.css'

function Result({ OrgId }) {
  const [inspectionDict] = useContext(InspectionContext)

  // Last local submission only (one inspection)
  const results = inspectionDict?.[OrgId] ?? []

  const submissionDate = new Date().toLocaleDateString("en-GB")

  // All possible data elements (full form)
const allDataElements = SCHOOL_INSPECTION_FIELDS.map(f => f.id)

  return (
    <>
          <HeatmapComparison schoolId={OrgId} />


      <div className={styles.graphsGrid}>
        {/* CASE 1: User just submitted something → use localPoints */}
        {results.length > 0 &&
          results.map(({ dataElement, value }) => (
            <GraphCard
              key={dataElement}
              schoolId={OrgId}
              dataElement={dataElement}
              localPoints={[
                {
                  label: submissionDate,
                  value: Number(value) || 0,
                },
              ]}
            />
          ))}

        {/* CASE 2: No local context (after refresh) → show graphs for ALL dataElements
            Using only historic DHIS2 data (localPoints=[])
        */}
        {results.length === 0 &&
          allDataElements.map((dataElement) => (
            <GraphCard
              key={dataElement}
              schoolId={OrgId}
              dataElement={dataElement}
            />
          ))}
      </div>
    </>
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
        label={`${name}`}
        localPoints={localPoints}
      />
    </div>
  )
}


export default Result
