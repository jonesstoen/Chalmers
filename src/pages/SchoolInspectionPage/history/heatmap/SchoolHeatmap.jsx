import Heatmap from './Heatmap'
import { useProcessedRatios } from './useProcessedRatios'
import { useLocalRatios } from './useLocalRatios'

export default function SchoolHeatmap({ schoolId, dataElements }) {
  // Compute local ratios if dataElements provided
  const localData = useLocalRatios(dataElements)

  // Fetch remote data if no local data
  const { processedData: remoteData, loading, error } = useProcessedRatios(
    schoolId
  )

  const combinedData = dataElements ? localData : remoteData

  if (loading) return <p>Loading ratios…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!combinedData?.length) return <p>No data available</p>

  return <Heatmap processed={combinedData} />
}
