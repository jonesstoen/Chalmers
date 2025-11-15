import { useState } from 'react'
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
import regression from 'regression'
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

  const [showRegression, setShowRegression] = useState(false)

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!timeSeries?.length) return <p>No data available.</p>

  // Extract values
  const periods = timeSeries.map((_, i) => i)
  const labels = timeSeries.map(p => p.period)
  const values = timeSeries.map(p => Math.max(0, p[dataElements[0]] ?? p.value)) // cap at 0

  // Compute regression if toggled on
  let regressionData = []
  let equation = ''
  if (showRegression && values.length > 2) {
    const result = regression.linear(periods.map((x, i) => [x, values[i]]), {
      precision: 4,
    })
    regressionData = result.points.map(([_, y]) => Math.max(0, y))
    equation = `${result.string} (R² = ${result.r2.toFixed(3)})`
  }

  // Dataset for the base data
  const datasets = [
    {
      label,
      data: values,
      borderWidth: 2,
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      tension: 0.3,
    },
  ]

  // Optional regression line
  if (showRegression && regressionData.length) {
    datasets.push({
      label: 'Regression line',
      data: regressionData,
      borderColor: 'red',
      borderWidth: 2,
      borderDash: [6, 6],
      fill: false,
      tension: 0.3,
    })
  }

  const chartData = { labels, datasets }

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true, // ensures it doesn’t go below 0
        min: 0,
      },
    },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: showRegression
          ? `${label} over time — ${equation}`
          : `${label} over time`,
      },
    },
  }

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showRegression}
            onChange={() => setShowRegression(!showRegression)}
          />
          Show regression
        </label>
      </div>
      <Line data={chartData} options={options} />
    </div>
  )
}
