// --- imports unchanged ---
import { useState, useMemo } from 'react'
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
import { useSchoolGraphData } from '../api/useSchoolGraphData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function SchoolGraph({
  schoolId,
  dataElements = [],
  label = 'Value',
  startDate = '2024-01-01',
  endDate = new Date().toISOString().split('T')[0],
  localPoints = [], // Local data
}) {
  const { graphData, loading, error } = useSchoolGraphData({
    programId: 'UxK2o06ScIe', // School Inspection
    stageId: 'eJiBjm9Rl7E',
    schoolId,
    startDate,
    endDate,
    dataElements,
  })

  const [showRegression, setShowRegression] = useState(false)

  // --- Combine remote + local ---
  const mergedData = useMemo(() => {
    const remote = graphData ?? []
    const local = Array.isArray(localPoints) ? localPoints : []

    // Combine and remove duplicates by date label
    const all = [...remote, ...local]
      .filter(p => p?.label && !isNaN(p?.value))
      .reduce((acc, curr) => {
        acc[curr.label] = curr // latest point per label wins
        return acc
      }, {})

    // Sort chronologically
    return Object.values(all).sort((a, b) => new Date(a.label) - new Date(b.label))
  }, [graphData, localPoints])

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!mergedData?.length) return <p>No data available.</p>

  const labels = mergedData.map(d => d.label)
  const values = mergedData.map(d => Math.max(0, d.value))

  // --- Regression logic (unchanged) ---
  let regressionData = []
  let equation = ''
  if (showRegression && values.length > 2) {
    const result = regression.linear(values.map((y, i) => [i, y]), { precision: 4 })
    regressionData = result.points.map(([_, y]) => Math.max(0, y))
    equation = `${result.string} (R² = ${result.r2.toFixed(3)})`
  }

  // --- Chart config ---
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
    scales: { y: { beginAtZero: true, min: 0 } },
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5rem' }}>
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
