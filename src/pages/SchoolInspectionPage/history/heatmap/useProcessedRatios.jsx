import { useSchoolAnalytics } from '../components/useSchoolAnalytics'
import { useMemo } from 'react'

const PROGRAM_ID = 'UxK2o06ScIe'
const STAGE_ID = 'eJiBjm9Rl7E'
const DATA_ELEMENTS = [
    'DO0LBJfXY00', // Learners
    'jcC1uz56IpY', // Seats
    'ya5SyA5hej4', // Classrooms
    'LME331J5aev', // Teachers
    'iytoDmoTUWY', // Toilets
]

export function useProcessedRatios(schoolId) {
    const { data, loading, error } = useSchoolAnalytics({
        programId: PROGRAM_ID,
        stageId: STAGE_ID,
        schoolId,
        dataElements: DATA_ELEMENTS,
    })

    const processedData = useMemo(() => {
        if (!data?.rows?.length || !data?.headers) return []
        const headers = data.headers.map(h => h.name)
        const findIdx = id => headers.indexOf(id)

        const idx = {
            learners: findIdx('DO0LBJfXY00'),
            seats: findIdx('jcC1uz56IpY'),
            classrooms: findIdx('ya5SyA5hej4'),
            teachers: findIdx('LME331J5aev'),
            toilets: findIdx('iytoDmoTUWY'),
            date: findIdx('eventdate'),
        }

        const rows = data.rows

        return rows.map(row => {
            const learners = Number(row[idx.learners]) || 0
            const seats = Number(row[idx.seats]) || 0
            const classrooms = Number(row[idx.classrooms]) || 0
            const teachers = Number(row[idx.teachers]) || 0
            const toilets = Number(row[idx.toilets]) || 0

            return {
                date: row[idx.date] || 'Unknown date',
                learners,
                seats,
                classrooms,
                teachers,
                toilets,
                ratios: {
                    seatsToLearner: learners ? learners / seats : NaN,
                    learnerToClassroom: classrooms ? learners / classrooms : NaN,
                    learnerToTeacher: teachers ? learners / teachers : NaN,
                    learnerToToilet: toilets ? learners / toilets : NaN,
                },
            }
        })
    }, [data])

    return { processedData, loading, error }
}
