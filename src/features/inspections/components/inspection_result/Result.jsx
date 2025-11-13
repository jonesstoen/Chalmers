import { useContext } from "react"
import InspectionContext from "../../../../context/InspectionContext"
import SchoolGraph from "../../../analytics/components/SchoolGraph"
import SchoolHeatmap from "../../../analytics/heatmap/SchoolHeatmap" // our param-driven heatmap

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
    <div style={{ padding: "1rem" }}>
      <h1>Summary</h1>
      <h2>Results for: {OrgId}</h2>

      {/* ------------------ Graphs ------------------ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        {results.map(({ dataElement, value }) => {
          const localPoints = [{ label: submissionDate, value: Number(value) || 0 }]
          return (
            <GraphCard
              key={dataElement}
              schoolId={OrgId}
              dataElement={dataElement}
              localPoints={localPoints}
            />
          )
        })}
      </div>

      {/* ------------------ Heatmaps ------------------ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem",
          marginTop: "3rem",
          alignItems: "start",
        }}
      >
        <HeatmapCard
          title="Latest Remote Inspection"
          schoolId={OrgId}
          // no dataElements = fetch latest remote
        />

        <HeatmapCard
          title="Just Submitted Inspection"
          schoolId={OrgId}
          dataElements={localSubmission} // pass local submission
        />
      </div>
    </div>
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

/* ------------------ Heatmap Card ------------------ */
function HeatmapCard({ title, schoolId, dataElements }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>{title}</h3>
      <SchoolHeatmap schoolId={schoolId} dataElements={dataElements} />
    </div>
  )
}

export default Result
