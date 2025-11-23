export default function AnalyticsTable({ data, loading, error }) {
    if (loading) return <p>Fetching analytics...</p>
    if (error) return <p>Error fetching analytics</p>
    if (!data?.rows?.length) return <p>No analytics data available for this stage.</p>

    return (
        <div style={{ overflowX:'auto', marginTop:'1rem' }}>
            <table style={{ borderCollapse:'collapse', width:'100%', fontSize:'0.9rem', background:'#fff', borderRadius:8, boxShadow:'0 0 4px rgba(0,0,0,0.1)' }}>
                <thead style={{ background:'#e9f3ff' }}>
                <tr>
                    {data.headers.map(h => (
                        <th key={h.name} style={{ borderBottom:'2px solid #ccc', padding:'0.5rem', textAlign:'left' }}>
                            {h.column || h.name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.rows.map((row, idx) => (
                    <tr key={idx}>
                        {row.map((cell, i) => (
                            <td key={i} style={{ padding:'0.5rem', borderBottom:'1px solid #eee' }}>{cell || '—'}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}