export default function getColor(value, thresholdFn) {
  if (isNaN(value)) return 'rgba(200,200,200,0.3)' // gray for unknown
  if (thresholdFn(value)) return `rgba(0,200,0,0.6)` // green
  return `rgba(220,0,0,0.6)` // red
}
