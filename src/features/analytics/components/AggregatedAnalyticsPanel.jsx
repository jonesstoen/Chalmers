// AggregatedAnalyticsPanel.jsx
import ClusterGraph from "./ClusterGraph";

import { CAPACITY_IDS, SANITATION_IDS,TOTAL_TOILETS_ID} from "../../inspections/configs/schoolInspectionConfig";
import { dataElementIdToDescription } from "../../inspections/configs/inspectionFormUtils";



function GraphCard({ OrgId, dataElementId }) {
  const label = dataElementIdToDescription(dataElementId);

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "1.5rem",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          margin: "0 0 1.2rem 0",
          fontSize: "1.15rem",
          fontWeight: "600",
          color: "#2d3748",
        }}
      >
        {label}
      </h3>
      <div style={{ flex: 1, minHeight: 340 }}>
        <ClusterGraph
          schoolId={OrgId}
          dataElements={[dataElementId]}
          label={label}
        />
      </div>
    </div>
  );
}


export default function AggregatedAnalyticsPanel({ data }) {
    const QUANTITATIVE_IDS = [...CAPACITY_IDS, ...SANITATION_IDS, TOTAL_TOILETS_ID]

    const OID = data?.ou?.id ?? null
    const name = data?.ou?.displayname || data?.ou?.name 
    return (
    <>
      <h1
        style={{
          marginBottom: "2.5rem",
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1a202c",
        }}
      >
        Cluster Analytics – {name}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {QUANTITATIVE_IDS.map((dataElementID) => (
          <GraphCard
            key={dataElementID}
            OrgId={OID}
            dataElementId={dataElementID}
          />
        ))}
      </div>
    </>
  );
}