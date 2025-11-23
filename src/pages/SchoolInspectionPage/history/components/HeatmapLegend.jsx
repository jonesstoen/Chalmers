import styles from './HeatmapLegend.module.css'

export function HeatmapLegend() {
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Color Legend
            </div>

            <div className={styles.gradientBar} />

            <div className={styles.labels}>
                <span>Bad</span>
                <span>Near Ideal</span>
                <span>Good</span>
            </div>
        </div>
    );
}
