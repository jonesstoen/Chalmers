// features/home/PrioritySchoolCard.jsx
export default function PrioritySchoolCard({
                                               name,
                                               district,
                                               status,
                                               onOpen,
                                           }) {
    return (
        <div
            style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 12,
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                }}
            >
                <h4
                    style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#0f172a',
                    }}
                >
                    {name}
                </h4>
                <span
                    style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: '#fef3c7',
                        color: '#92400e',
                    }}
                >
                    {status}
                </span>
            </div>

            <span style={{ fontSize: 12, color: '#64748b' }}>
                District: {district}
            </span>

            <div style={{ marginTop: 8 }}>
                <button
                    type="button"
                    onClick={onOpen}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: '1px solid #2563eb',
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Open in inspector
                </button>
            </div>
        </div>
    )
}