// features/inspections/utils/inspectionFormUtils.js
import { CHILD_FIELD_IDS, SCHOOL_INSPECTION_FIELDS } from './schoolInspectionConfig'

export const computeTotalToilets = (formState) =>
    (Number(formState['I13NTyLrHBm']) || 0) +
    (Number(formState['QXcKg7GSr4e']) || 0) +
    (Number(formState['OGmIo4kFUYr']) || 0)

export const validateSchoolInspection = (formState) => {
    const newErrors = {}

    // Clean classrooms kan ikke overstige total classrooms
    const clean = Number(formState['XIgpDhDC4Ol']) || 0
    const totalRooms = Number(formState['ya5SyA5hej4']) || 0
    if (clean > totalRooms) {
        newErrors['XIgpDhDC4Ol'] = 'Cannot exceed total classrooms'
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
        total += 1
        const v = formState[field.id]
        if (v !== undefined && v !== '') filled += 1

        if (field.child_query) {
            total += 1
            const cv = formState[field.child_query.id]
            if (cv !== undefined && cv !== '') filled += 1
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