export function ThresholdLegend() {
    return (
       <div
    style={{
        marginTop: "2rem",
        width: "100%",
        maxWidth: "600px",
        padding: "1.5rem",
        borderRadius: "12px",
        background: "#fafafa",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        textAlign: "left",
    }}
>
    <h3 style={{ marginBottom: "1rem", textAlign: "center", fontWeight: 600 }}>
        Ideal Thresholds
    </h3>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem 1rem",
        }}
    >
        {/* CHIP 1 */}
        <div
            style={{
                background: "#e8f0fe",
                padding: "0.6rem 1rem",
                borderRadius: "999px",
                display: "flex",
                flexDirection: "column",
                fontSize: "0.9rem",
            }}
        >
            <span style={{ fontWeight: 600 }}>Learners / Seat</span>
            <span style={{ opacity: 0.7 }}>Ideal: ≥ 1</span>
        </div>

        {/* CHIP 2 */}
        <div
            style={{
                background: "#e8f0fe",
                padding: "0.6rem 1rem",
                borderRadius: "999px",
                display: "flex",
                flexDirection: "column",
                fontSize: "0.9rem",
            }}
        >
            <span style={{ fontWeight: 600 }}>Learners / Classroom</span>
            <span style={{ opacity: 0.7 }}>Ideal: ≤ 53</span>
        </div>

        {/* CHIP 3 */}
        <div
            style={{
                background: "#e8f0fe",
                padding: "0.6rem 1rem",
                borderRadius: "999px",
                display: "flex",
                flexDirection: "column",
                fontSize: "0.9rem",
            }}
        >
            <span style={{ fontWeight: 600 }}>Learners / Teacher</span>
            <span style={{ opacity: 0.7 }}>Ideal: ≤ 45</span>
        </div>

        {/* CHIP 4 */}
        <div
            style={{
                background: "#e8f0fe",
                padding: "0.6rem 1rem",
                borderRadius: "999px",
                display: "flex",
                flexDirection: "column",
                fontSize: "0.9rem",
            }}
        >
            <span style={{ fontWeight: 600 }}>Learners / Toilet</span>
            <span style={{ opacity: 0.7 }}>Ideal: ≤ 25</span>
        </div>
    </div>
</div>

    );
}
