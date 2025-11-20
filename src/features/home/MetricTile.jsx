// features/home/MetricTile.jsx (eller hvor den ligger)
export default function MetricTile({ title, value, subtitle }) {
    return (
        <div
            style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 14,
                boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}
        >
            <span style={{ fontSize: 12, color: '#64748b' }}>{title}</span>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{value}</span>
            {subtitle && (
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {subtitle}
                </span>
            )}
        </div>
    )
}