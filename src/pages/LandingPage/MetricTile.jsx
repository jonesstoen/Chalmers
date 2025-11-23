// pages/LandingPage/MetricTile.jsx
import styles from './MetricTile.module.css'

export default function MetricTile({ title, value, subtitle }) {
    return (
        <div className={styles.tile}>
            <span className={styles.title}>{title}</span>
            <span className={styles.value}>{value}</span>
            {subtitle && (
                <span className={styles.subtitle}>
                    {subtitle}
                </span>
            )}
        </div>
    )
}