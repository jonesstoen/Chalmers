export default function SeatToLearnerList({ ratios }) {
    if (!ratios) return null
    return (
        <div style={{ marginTop:'1rem' }}>
            <h4>Seat-to-Learner Ratios</h4>
            <ul>
                {Object.keys(ratios).map(level => (
                    <li key={level}>
                        <strong>{level}:</strong>{' '}
                        {ratios[level].learners === 0
                            ? 'No learner data available'
                            : `${ratios[level].actual.toFixed(2)} (actual seats: ${ratios[level].seatsActual}, learners: ${ratios[level].learners})`}
                    </li>
                ))}
            </ul>
        </div>
    )
}