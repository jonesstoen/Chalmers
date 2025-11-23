import styles from './AnalyticsTable.module.css'

export default function AnalyticsTable({ data, loading, error }) {
    if (loading) return <p>Fetching analytics...</p>
    if (error) return <p>Error fetching analytics</p>
    if (!data?.rows?.length) return <p>No analytics data available for this stage.</p>

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                <tr>
                    {data.headers.map(h => (
                        <th key={h.name} className={styles.th}>
                            {h.column || h.name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.rows.map((row, idx) => (
                    <tr key={idx}>
                        {row.map((cell, i) => (
                            <td key={i} className={styles.td}>{cell || '—'}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}