
import { useMemo } from 'react'
import useFetchAnalytics from './analyticsAPI'

/**
 * General-purpose DHIS2 analytics hook.
 *
 * @param {Object} options - All parameters for the analytics query.
 * @param {string} options.programId - Program ID (required)
 * @param {Object} [options.stage] - Object containing { id, startDate, endDate }
 * @param {Array} [options.filters] - Array of filter objects [{ itemid, operator, filter }]
 * @param {Array<string>} [options.orgUnitIds] - Org unit IDs
 * @param {boolean} [options.includeDescendants] - Whether to include descendants (aggregate)
 *
 * @returns {Object} { data, headers, rows, loading, error }
 */
/*
export function AnalyticsSection({
    programId,
    stage = {},
    filters = [],
    orgUnitIds = [],
    includeDescendants = true,
}) {
    const { id: stageId, startDate, endDate } = stage

    const stageParams = useMemo(
        () => ({
            stage: stageId,
            startDate,
            endDate,
        }),
        [stageId, startDate, endDate]
    )

    const { data, loading, error } = useFetchAnalytics(
        programId,
        stageParams,
        filters,
        orgUnitIds,
        includeDescendants
    )

    const headers = data?.analytics?.headers || []
    const rows = data?.analytics?.rows || []

    return { data, headers, rows, loading, error }
}
*/