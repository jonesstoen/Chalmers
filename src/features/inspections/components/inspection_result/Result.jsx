import { useContext } from "react"
import InspectionContext from "../../../../context/InspectionContext"
import SchoolGraph from "../../../analytics/components/SchoolGraph"
import HeatmapComparison from "../../../analytics/heatmap/HeatmapComparison"

function Result({ OrgId }) {
  const [inspectionDict] = useContext(InspectionContext)
  const results = inspectionDict[OrgId]

  if (!results?.length) {
    return <p>Submit an inspection for {OrgId} to see a summary.</p>
  }

  // Build local submission object for heatmap / graphs
  const localSubmission = results.reduce((acc, curr) => {
    acc[curr.dataElement] = curr.value
    return acc
  }, {})

  const submissionDate = new Date().toLocaleDateString("en-GB")

  return (
    <><HeatmapComparison schoolId={OrgId}/>

{/* Graphs below */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
  {results.map(({ dataElement, value }) => (
    <GraphCard
      key={dataElement}
      schoolId={OrgId}
      dataElement={dataElement}
      localPoints={[{ label: submissionDate, value: Number(value) || 0 }]}
    />
  ))}
</div>
</>
  )
}

/* ------------------ Graph Card ------------------ */
function GraphCard({ schoolId, dataElement, localPoints }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <SchoolGraph
        schoolId={schoolId}
        dataElements={[dataElement]}
        label={`Data Element: ${dataElement}`}
        localPoints={localPoints}
      />
    </div>
  )
}


export default Result
