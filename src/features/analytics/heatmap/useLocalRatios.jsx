import { useMemo } from 'react'

export function useLocalRatios(localSubmission) {
  return useMemo(() => {
    if (!localSubmission) return null

    const learners = Number(localSubmission.DO0LBJfXY00) || 0
    const seats = Number(localSubmission.jcC1uz56IpY) || 0
    const classrooms = Number(localSubmission.ya5SyA5hej4) || 0
    const teachers = Number(localSubmission.LME331J5aev) || 0
    const toilets = Number(localSubmission.iytoDmoTUWY) || 0

    return [
      {
        date: new Date().toLocaleDateString('en-GB'),
        learners,
        seats,
        classrooms,
        teachers,
        toilets,
        ratios: {
          seatsToLearner: learners ? seats / learners : NaN,
          learnerToClassroom: classrooms ? learners / classrooms : NaN,
          learnerToTeacher: teachers ? learners / teachers : NaN,
          learnerToToilet: toilets ? learners / toilets : NaN,
        },
        source: 'local',
      },
    ]
  }, [localSubmission])
}
