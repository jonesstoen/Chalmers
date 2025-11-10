// Script to populate school inspection data for all schools in Edutopia
// This creates sample inspection data for testing purposes

import { useDataEngine, useDataQuery } from '@dhis2/app-runtime'

const SCHOOL_INSPECTION_PROGRAM = 'UxK2o06ScIe'
const SCHOOL_INSPECTION_STAGE = 'eJiBjm9Rl7E'

// School inspection data elements
const DATA_ELEMENTS = {
    computerLabPresent: 'Nvp4hIbXrzF',
    computerLabCondition: 'gzhjCMe7OyS',
    electricityAvailable: 'IKiSAA19Xvl',
    electricityCondition: 'MH2eDd7qWxR',
    handwashingAvailable: 'n9KwS4rY2HC',
    handwashingCondition: 'ie3bFiVatHT',
    libraryAvailable: 'Y6DQqwTdhiZ',
    libraryCondition: 'IAomDvMcUDr',
    numberOfClassrooms: 'ya5SyA5hej4',
    cleanSecureClassrooms: 'XIgpDhDC4Ol',
    playgroundAvailable: 'XThfmg6f2oC',
    playgroundCondition: 'JzZfwXtdL6G',
    toiletsTeachers: 'I13NTyLrHBm',
    toiletsBoys: 'QXcKg7GSr4e',
    toiletsGirls: 'OGmIo4kFUYr',
    totalToilets: 'iytoDmoTUWY',
    learners: 'DO0LBJfXY00',
    seats: 'jcC1uz56IpY',
    teachers: 'LME331J5aev',
}

// Helper function to generate random inspection data
const generateInspectionData = () => {
    const hasComputerLab = Math.random() > 0.6
    const hasElectricity = Math.random() > 0.4
    const hasHandwashing = Math.random() > 0.5
    const hasLibrary = Math.random() > 0.7
    const hasPlayground = Math.random() > 0.3
    
    const numClassrooms = Math.floor(Math.random() * 20) + 5
    const numLearners = Math.floor(Math.random() * 500) + 100
    const numTeachers = Math.floor(Math.random() * 20) + 5
    const numSeats = Math.floor(numLearners * (0.6 + Math.random() * 0.8)) // 60-140% of learners
    
    const dataValues = []
    
    // Add values only if they are non-zero/non-false
    // Note: Condition fields are skipped because they use option sets with specific codes
    if (hasComputerLab) {
        dataValues.push({ dataElement: DATA_ELEMENTS.computerLabPresent, value: 'true' })
        // Skip computerLabCondition - it uses an option set
    }
    
    if (hasElectricity) {
        dataValues.push({ dataElement: DATA_ELEMENTS.electricityAvailable, value: 'true' })
        // Skip electricityCondition - it uses an option set
    }
    
    if (hasHandwashing) {
        dataValues.push({ dataElement: DATA_ELEMENTS.handwashingAvailable, value: 'true' })
        // Skip handwashingCondition - it uses an option set
    }
    
    if (hasLibrary) {
        dataValues.push({ dataElement: DATA_ELEMENTS.libraryAvailable, value: 'true' })
        // Skip libraryCondition - it uses an option set
    }
    
    if (hasPlayground) {
        dataValues.push({ dataElement: DATA_ELEMENTS.playgroundAvailable, value: 'true' })
        // Skip playgroundCondition - it uses an option set
    }
    
    // Always add these numeric values
    dataValues.push({ dataElement: DATA_ELEMENTS.numberOfClassrooms, value: String(numClassrooms) })
    dataValues.push({ dataElement: DATA_ELEMENTS.cleanSecureClassrooms, value: String(Math.floor(numClassrooms * (0.5 + Math.random() * 0.5))) })
    dataValues.push({ dataElement: DATA_ELEMENTS.toiletsTeachers, value: String(Math.floor(Math.random() * 3) + 1) })
    dataValues.push({ dataElement: DATA_ELEMENTS.toiletsBoys, value: String(Math.floor(Math.random() * 10) + 5) })
    dataValues.push({ dataElement: DATA_ELEMENTS.toiletsGirls, value: String(Math.floor(Math.random() * 10) + 5) })
    dataValues.push({ dataElement: DATA_ELEMENTS.totalToilets, value: String(Math.floor(Math.random() * 25) + 10) })
    dataValues.push({ dataElement: DATA_ELEMENTS.learners, value: String(numLearners) })
    dataValues.push({ dataElement: DATA_ELEMENTS.seats, value: String(numSeats) })
    dataValues.push({ dataElement: DATA_ELEMENTS.teachers, value: String(numTeachers) })
    
    return dataValues
}

// Query to fetch all schools (level 5 org units)
// Replace this section in your script
// RlPlK44dtoo Bp3y61WbHwn
const REGION_ID = 'Bp3y61WbHwn' // e.g., Kanifing

const schoolsQuery = {
    schools: {
        resource: 'organisationUnits',
        params: {
            filter: [`path:like:${REGION_ID}`],
            fields: 'id,name,displayName,level,children',
            paging: false,
        },
    },
}



// Main function to populate inspections
export async function populateSchoolInspections(engine) {
    console.log('Starting school inspection data population...')
    
    try {
        // Fetch all schools
       // Inside populateSchoolInspections()
const { schools } = await engine.query(schoolsQuery)
const allUnits = schools.organisationUnits || []

// Keep only "schools" = leaf nodes (no children)
const schoolList = allUnits.filter(u => !u.children || u.children.length === 0)

console.log(`Found ${schoolList.length} schools under region ${REGION_ID}`)

        
        console.log(`Found ${schoolList.length} schools`)
        
        const today = new Date().toISOString().split('T')[0]
        let successCount = 0
        let errorCount = 0
        
        // Process schools in batches to avoid overwhelming the server
        for (let i = 0; i < schoolList.length; i++) {
            const school = schoolList[i]
            
            try {
                const dataValues = generateInspectionData()
                
                // Create event payload
                const eventPayload = {
                    events: [
                        {
                            program: SCHOOL_INSPECTION_PROGRAM,
                            programStage: SCHOOL_INSPECTION_STAGE,
                            orgUnit: school.id,
                            occurredAt: `${today}T00:00:00.000`,
                            status: 'COMPLETED',
                            dataValues,
                        },
                    ],
                }
                
                // Post event
                const mutation = {
                    resource: 'tracker',
                    type: 'create',
                    params: { async: false },
                    data: eventPayload,
                }
                
                const result = await engine.mutate(mutation)
                
                if (result.status === 'OK' || result.stats?.created > 0) {
                    successCount++
                    console.log(`✅ [${i + 1}/${schoolList.length}] ${school.displayName || school.name}`)
                } else if (result.stats?.ignored > 0) {
                    errorCount++
                    const errorMsg = result.validationReport?.errorReports?.[0]?.message || 'Event ignored'
                    console.warn(`⚠️ [${i + 1}/${schoolList.length}] ${school.displayName || school.name} - ${errorMsg}`)
                } else {
                    errorCount++
                    const errorMsg = result.validationReport?.errorReports?.[0]?.message || 'Unknown error'
                    console.error(`❌ [${i + 1}/${schoolList.length}] ${school.displayName || school.name}: ${errorMsg}`)
                }
                
                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300))
                
            } catch (err) {
                errorCount++
                console.error(`❌ [${i + 1}/${schoolList.length}] ${school.displayName || school.name}:`, err.message || err)
                if (err.details) {
                    console.error('Error details:', err.details)
                }
            }
        }
        
        console.log('\n=== Summary ===')
        console.log(`Total schools: ${schoolList.length}`)
        console.log(`Successful: ${successCount}`)
        console.log(`Errors: ${errorCount}`)
        console.log('\nNote: Errors are typically due to:')
        console.log('- School inspection program not assigned to those schools')
        console.log('- User lacks permission to create events for those schools')
        console.log('- Duplicate events (school already has inspection data for today)')
        
        return { total: schoolList.length, success: successCount, errors: errorCount }
        
    } catch (err) {
        console.error('Failed to fetch schools:', err)
        throw err
    }
}

// React hook wrapper for use in components
export function usePopulateSchoolInspections() {
    const engine = useDataEngine()
    
    const run = async () => {
        return await populateSchoolInspections(engine)
    }
    
    return { run }
}
