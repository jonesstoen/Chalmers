import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useAggregatedSchoolAnalytics } from '../hooks/useAggregatedSchoolAnalytics'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function ClusterGraph({
  schoolId,
  dataElements = [],
  label = 'Value',
  startDate = '2024-01-01',
  endDate = new Date().toISOString().split('T')[0],
}) {
  const { timeSeries, loading, error } = useAggregatedSchoolAnalytics({
    schoolId,
    dataElementIds: dataElements,
    startDate,
    endDate,
  })

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!timeSeries?.length) return <p>No data available.</p>

  const periods = timeSeries.map(p => p.period)
  const datasets =
    dataElements.length === 1
      ? [
          {
            label,
            data: timeSeries.map(p => p[dataElements[0]] ?? p.value),
            borderWidth: 2,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
          },
        ]
      : dataElements.map((id, i) => ({
          label: id,
          data: timeSeries.map(p => p[id]),
          borderWidth: 2,
          borderColor: `hsl(${(i * 70) % 360}, 70%, 50%)`,
          backgroundColor: 'transparent',
        }))

  const chartData = { labels: periods, datasets }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${label} over time` },
    },
  }

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
