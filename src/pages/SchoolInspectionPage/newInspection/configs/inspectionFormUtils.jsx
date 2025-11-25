// pages/SchoolInspectionPage/newInspection/configs/inspectionFormUtils.jsx
import { CHILD_FIELD_IDS, SCHOOL_INSPECTION_FIELDS, TOTAL_TOILETS_ID } from './schoolInspectionConfig'

export const computeTotalToilets = (formState) =>
    (Number(formState['I13NTyLrHBm']) || 0) +
    (Number(formState['QXcKg7GSr4e']) || 0) +
    (Number(formState['OGmIo4kFUYr']) || 0)

export const validateSchoolInspection = (formState) => {
    const newErrors = {}

    // Clean classrooms kan ikke overstige total classrooms
    const cleanRaw = formState['XIgpDhDC4Ol']
    const totalRaw = formState['ya5SyA5hej4']
    const hasCleanValue =
        cleanRaw !== undefined && cleanRaw !== null && cleanRaw !== ''
    const hasTotalValue =
        totalRaw !== undefined && totalRaw !== null && totalRaw !== ''

    if (hasCleanValue && hasTotalValue) {
        const clean = Number(cleanRaw)
        const totalRooms = Number(totalRaw)
        if (
            !Number.isNaN(clean) &&
            !Number.isNaN(totalRooms) &&
            clean > totalRooms
        ) {
            newErrors['XIgpDhDC4Ol'] = `Cannot exceed total classrooms (${totalRooms})`
        }
    }

    // Barn 1–5
    SCHOOL_INSPECTION_FIELDS.forEach(field => {
        if (field.child_query) {
            const childId = field.child_query.id
            const rawChild = formState[childId]

            if (rawChild != null && rawChild !== '') {
                const childValue = Number(rawChild)
                if (Number.isNaN(childValue) || childValue < 1 || childValue > 5) {
                    newErrors[childId] = 'Value must be between 1 and 5'
                }
            }
        }
    })

    return newErrors
}

export const computeProgress = (formState) => {
    let filled = 0
    let total = 0

    SCHOOL_INSPECTION_FIELDS.forEach(field => {
        // Skip auto-calculated fields
        if (field.id === TOTAL_TOILETS_ID) {
            return
        }

        const v = formState[field.id]
        
        if (field.type === 'BOOLEAN' && field.child_query) {
            // For Available/Unavailable fields with condition rating
            total += 1
            
            if (v === true || v === 'true') {
                // If "Available" is selected, need condition rating to count as complete
                const childValue = formState[field.child_query.id]
                if (childValue !== undefined && childValue !== null && childValue !== '') {
                    filled += 1
                }
            } else if (v === false || v === 'false') {
                // If "Unavailable" is selected, counts as complete
                filled += 1
            }
            // If null (deselected), doesn't count
            
            // Child field (condition rating) is only counted if parent is "Available"
            // So we don't add it to total separately
        } else if (field.type === 'BOOLEAN') {
            // Simple boolean field (no child)
            total += 1
            if (v === true || v === 'true' || v === false || v === 'false') {
                filled += 1
            }
            // If null (deselected), doesn't count
        } else {
            // Numeric field
            total += 1
            // Count if value is defined and not empty (including 0)
            if (v !== undefined && v !== null && v !== '') {
                // 0 is a valid input, so count it
                const numValue = Number(v)
                if (!Number.isNaN(numValue)) {
                    filled += 1
                }
            }
        }
    })

    const pct = total > 0 ? Math.round((filled / total) * 100) : 0
    return { filledCount: filled, totalCount: total, progressPct: pct }
}

// Felles normalisering av input (negative tall + max 5 på barn)
export const normalizeChange = (id, value) => {
    let newValue = value

    const numeric = Number(value)
    const isNumeric = !Number.isNaN(numeric)

    if (isNumeric && numeric < 0) {
        newValue = 0
    }

    if (CHILD_FIELD_IDS.includes(id) && isNumeric && numeric > 5) {
        newValue = 5
    }

    return newValue
}

export function dataElementIdToDescription(dataElementID){
    const object = SCHOOL_INSPECTION_FIELDS.find(item => item.id === dataElementID)
    const description = object?.label ?? 'Undefined'
    return description
}