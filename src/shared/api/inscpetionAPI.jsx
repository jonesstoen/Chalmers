import { useDataQuery } from '@dhis2/app-runtime'
import { useOrgUnitTree } from './useOrgUnitTree'

export function useSchoolProgramData({ rootIds, programId, stageId }) {
    const tree = useOrgUnitTree({ rootIds })
    const selectedOrgUnit = tree.selected[0]

    // Dynamic query: only fetch when a school is selected
    const query = selectedOrgUnit
        ? {
              events: {
                  resource: `analytics/events/query/${programId}`,
                  params: {
                      dimension: `ou:${selectedOrgUnit}`,
                      stage: stageId, // optional, only if you want one stage
                      // You can also add dimensions like "displayName"
                  },
              },
          }
        : null

    const { data, loading, error } = useDataQuery(query)

    return { ...tree, data, loading, error }
}
