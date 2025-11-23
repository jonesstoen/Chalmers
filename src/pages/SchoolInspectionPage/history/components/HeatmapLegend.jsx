export function HeatmapLegend() {
    return (
        <div style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem"
        }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Color Legend
            </div>

            <div style={{
                width: "260px",
                height: "22px",
                borderRadius: "6px",
                background: `
                    linear-gradient(
                        to right,
                        hsl(0, 80%, 45%),   /* strong red */
                        hsl(0, 55%, 65%),   /* softer red */
                        hsl(0, 0%, 85%),    /* neutral gray */
                        hsl(120, 55%, 65%), /* soft green */
                        hsl(120, 80%, 45%)  /* strong green */
                    )
                `,
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
            }} />

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                width: "260px",
                fontSize: "0.75rem",
                opacity: 0.8
            }}>
                <span>Bad</span>
                <span>Near Ideal</span>
                <span>Good</span>
            </div>
        </div>
    );
}
