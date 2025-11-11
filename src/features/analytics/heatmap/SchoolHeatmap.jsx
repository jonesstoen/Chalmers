import Heatmap from './Heatmap'
import { useProcessedRatios } from './useProcessedRatios'

export default function SchoolHeatmap({ schoolId }) {
    const { processedData, loading, error } = useProcessedRatios(schoolId)

    if (loading) return <p>Loading ratios…</p>
    if (error) return <p>Error: {error.message}</p>
    if (!processedData?.length) return <p>No data available</p>

    return <Heatmap processed={processedData} />
}
