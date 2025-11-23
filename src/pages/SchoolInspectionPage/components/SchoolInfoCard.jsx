import styles from './SchoolInfoCard.module.css'

export default function SchoolInfoCard({ ou, hasEnrollmentStage, studentCount, studentCountLoading, studentCountError, onPickStage }) {
    return (
        <div className={styles.card}>
            <p><strong>Name:</strong> {ou.displayName || ou.name}</p>
            <p><strong>ID:</strong> {ou.id}</p>
            <p><strong>Parent:</strong> {ou.parent?.name || '—'}</p>
            <p><strong>Level:</strong> {ou.level ?? '—'}</p>
            <p><strong>Children:</strong> {ou.children?.length ?? 0}</p>

            {hasEnrollmentStage && (
                <p><strong>Student count:</strong> {studentCountLoading ? 'Loading...' : (studentCountError ? 'Error' : (studentCount ?? '—'))}</p>
            )}

            <div className={styles.programsSection}>
                <strong>Programs:</strong>
                {ou.programs?.length ? (
                    <ul>
                        {ou.programs.map(p => (
                            <li key={p.id}>
                                <span>{p.name}</span>
                                {!!p.programStages?.length && (
                                    <ul className={styles.programStagesList}>
                                        {p.programStages.map(s => (
                                            <li key={s.id} className={styles.programStageItem}
                                                onClick={() => onPickStage?.(p.id, s.id)}>
                                                • {s.displayName || s.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : <p>None</p>}
            </div>
        </div>
    )
}