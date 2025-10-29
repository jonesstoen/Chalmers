import { useState, useCallback } from 'react'

/**
 *
 * @param {Object} options
 * @param {string[]} options.rootIds - Root organisation unit IDs (required)
 * @param {boolean} [options.singleSelection=false] - Allow only one node selected
 * @returns {Object} { roots, selected, initiallyExpanded, handleChange }
 */
export function useOrgUnitTree({ rootIds = [], singleSelection = false }) {
    const [selected, setSelected] = useState([])
    const [initiallyExpanded, setInitiallyExpanded] = useState(rootIds)

    // Handles selection logic when user clicks a node
    const handleChange = useCallback(
        (newSelected) => {
            if (singleSelection) { // This is if a user wants to aggregate and choose which data to analyse, dont know if we will need this?
                // Only one can be selected at a time
                const id = Object.keys(newSelected)[0]
                setSelected(id ? [id] : [])
            } else {
                // Multiple selection allowed
                const selectedIds = Object.keys(newSelected)
                setSelected(selectedIds)
            }
        },
        [singleSelection]
    )
    return {
        roots: rootIds,
        selected,
        initiallyExpanded,
        handleChange,
    }
}
// import { useDataValueQuery } from '@dhis2/app-service-datavalue'
//              aggregering av underliggende noder
// export function useOrgUnitTreeWithData({ rootIds, dataSet }) {
//     const tree = useOrgUnitTree({ rootIds, singleSelection: true })
//     const selectedOrgUnit = tree.selected[0]

//     const { data, loading, error } = useDataValueQuery(
//         selectedOrgUnit
//             ? {
//                   orgUnit: selectedOrgUnit,
//                   dataSet,
//                   period: '202401', // or dynamic period
//               }
//             : null
//     )

//     return { ...tree, data, loading, error }
// }
