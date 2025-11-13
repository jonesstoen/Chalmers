import getColor from "./getColor"

export default function RatioCard({ label, value, thresholdFn }) {
  const color = getColor(value, thresholdFn)
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'center',
        color: '#111',
        fontWeight: 'bold',
      }}
    >
      <div>{label}</div>
      <div>{isNaN(value) ? 'N/A' : value.toFixed(2)}</div>
    </div>
  )
}
