import styles from './FullHeatmapLegend.module.css'

export function FullHeatmapLegend() {
    return (
        <div className={styles.container}>
            {/* Title */}
            <div className={styles.title}>
                Color Legend
            </div>

            {/* Gradient bar */}
            <div className={styles.gradientBar} />

            {/* Labels under bar */}
            <div className={styles.labels}>
                <span>Bad</span>
                <span>Near Ideal</span>
                <span>Good</span>
            </div>

            {/* Small threshold chips below */}
            <div className={styles.chipsContainer}>
                {[
                    ["Learners / Seat", "≤ 1"],
                    ["Learners / Classroom", "≤ 53"],
                    ["Learners / Teacher", "≤ 45"],
                    ["Learners / Toilet", "≤ 25"],
                ].map(([label, val]) => (
                    <div key={label} className={styles.chip}>
                        <strong className={styles.chipLabel}>
                            {label}
                        </strong>
                        <span className={styles.chipValue}>
                            Ideal: {val}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
