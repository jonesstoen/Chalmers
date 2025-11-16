import { useState, useCallback } from 'react'

// brukes ikkke !!!!!
/*
export function useOrgUnitTree({ rootIds = [], singleSelection = false }) {
    const [selected, setSelected] = useState([])
    const [initiallyExpanded] = useState(rootIds.map(id => `/${id}`)) // paths not raw IDs

   const handleChange = useCallback(
    (newSelected) => {
        if (!newSelected) return

        let ids = []

        // CASE 1: user selected node map (old DHIS2 format)
        if (typeof newSelected === 'object' && !Array.isArray(newSelected)) {
            const paths = Object.keys(newSelected)
            ids = paths.map((path) => path.replace('/', '')).filter(Boolean)
        }

        // CASE 2: user clicked node object (newer format)
        if (Array.isArray(newSelected)) {
            ids = newSelected
                .map((node) => (node?.id ? node.id : null))
                .filter(Boolean)
        }

        // CASE 3: user clicked a single node directly
        if (newSelected.id) {
            ids = [newSelected.id]
        }

        if (singleSelection) {
            setSelected(ids.length ? [ids[0]] : [])
        } else {
            setSelected(ids)
        }

        console.log('✅ Selected org unit IDs:', ids)
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

*/


// const handleChange = useCallback(
//     (newSelected) => {
//         const ids = Object.keys(newSelected || {}).filter(k => k && k !== 'displayName')
//         setSelected(ids.length ? [ids[0]] : [])
//     },
//     []
// )

// 