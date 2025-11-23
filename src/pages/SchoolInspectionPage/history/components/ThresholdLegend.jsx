import styles from './ThresholdLegend.module.css'

export function ThresholdLegend() {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                Ideal Thresholds
            </h3>

            <div className={styles.chipsGrid}>
                {/* CHIP 1 */}
                <div className={styles.chip}>
                    <span className={styles.chipLabel}>Learners / Seat</span>
                    <span className={styles.chipValue}>Ideal: ≥ 1</span>
                </div>

                {/* CHIP 2 */}
                <div className={styles.chip}>
                    <span className={styles.chipLabel}>Learners / Classroom</span>
                    <span className={styles.chipValue}>Ideal: ≤ 53</span>
                </div>

                {/* CHIP 3 */}
                <div className={styles.chip}>
                    <span className={styles.chipLabel}>Learners / Teacher</span>
                    <span className={styles.chipValue}>Ideal: ≤ 45</span>
                </div>

                {/* CHIP 4 */}
                <div className={styles.chip}>
                    <span className={styles.chipLabel}>Learners / Toilet</span>
                    <span className={styles.chipValue}>Ideal: ≤ 25</span>
                </div>
            </div>
        </div>
    );
}
