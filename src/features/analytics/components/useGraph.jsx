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

// Hardcoded program and stage, flexible for others
export default function Graph({
  schoolId,
  dataElements = [],
  label = 'Value',
  startDate = '2024-01-01',
  endDate = new Date().toISOString().split('T')[0],
}) {
  const { graphData, loading, error } = useSchoolGraphData({
    programId: 'UxK2o06ScIe',   // School Inspection
    stageId: 'eJiBjm9Rl7E',     // School Inspection stage
    schoolId,
    startDate,
    endDate,
    dataElements,
  })

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!graphData?.length) return <p>No data available.</p>

  const chartData = {
    labels: graphData.map(d => d.label),
    datasets: [
      {
        label,
        data: graphData.map(d => d.value),
        borderWidth: 2,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
    ],
  }

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
