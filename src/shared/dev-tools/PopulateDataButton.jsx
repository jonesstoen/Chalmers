import React, { useState } from 'react'
import { Button, CircularLoader } from '@dhis2/ui'
import { usePopulateSchoolInspections } from './populateSchoolInspections'
import styles from './PopulateDataButton.module.css'

export default function PopulateDataButton() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const { run } = usePopulateSchoolInspections()
    
    const handleClick = async () => {
        if (!window.confirm('This will create inspection data for ALL schools. Are you sure?')) {
            return
        }
        
        setLoading(true)
        setResult(null)
        
        try {
            const summary = await run()
            setResult(summary)
        } catch (err) {
            setResult({ error: err.message })
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className={styles.container}>
            <h4>🧪 Test Data Generator</h4>
            <p className={styles.description}>
                Generate sample school inspection data for all schools in the system.
            </p>
            
            {loading && (
                <div className={styles.loadingContainer}>
                    <CircularLoader small />
                    <p>Populating school inspections... This may take a few minutes.</p>
                </div>
            )}
            
            {result && !result.error && (
                <div className={styles.successMessage}>
                    <strong>✅ Population Complete!</strong>
                    <ul>
                        <li>Total schools: {result.total}</li>
                        <li>Successful: {result.success}</li>
                        <li>Errors: {result.errors}</li>
                    </ul>
                </div>
            )}
            
            {result?.error && (
                <div className={styles.errorMessage}>
                    <strong>❌ Error:</strong> {result.error}
                </div>
            )}
            
            <Button onClick={handleClick} disabled={loading}>
                {loading ? 'Populating...' : 'Populate All Schools'}
            </Button>
        </div>
    )
}
