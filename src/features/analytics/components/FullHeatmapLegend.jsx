export function FullHeatmapLegend() {
    return (
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {/* Title */}
            <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                Color Legend
            </div>

            {/* Gradient bar */}
            <div
                style={{
                    width: "240px",
                    height: "14px",
                    borderRadius: "6px",
                    margin: "0 auto",
                    background: "linear-gradient(to right, #d9534f, #e0e0e0, #4caf50)",
                }}
            />

            {/* Labels under bar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "240px",
                    margin: "4px auto 0",
                    fontSize: "0.7rem",
                    color: "#555",
                }}
            >
                <span>Bad</span>
                <span>Near Ideal</span>
                <span>Good</span>
            </div>

            {/* Small threshold chips below */}
            <div
                style={{
                    marginTop: "1rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center",
                }}
            >
                {[
                    ["Learners / Seat", "≥ 1"],
                    ["Learners / Classroom", "≤ 53"],
                    ["Learners / Teacher", "≤ 45"],
                    ["Learners / Toilet", "≤ 25"],
                ].map(([label, val]) => (
                    <div
                        key={label}
                        style={{
                            padding: "6px 10px",
                            fontSize: "0.75rem",
                            background: "rgba(0,0,0,0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(0,0,0,0.08)",
                            minWidth: "120px",
                            textAlign: "center",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                    >
                        <strong style={{ display: "block", fontSize: "0.75rem" }}>
                            {label}
                        </strong>
                        <span style={{ fontSize: "0.7rem", color: "#444" }}>
                            Ideal: {val}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
