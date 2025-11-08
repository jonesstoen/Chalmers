import React, { useState } from 'react'
import { Button, CircularLoader } from '@dhis2/ui'
import { usePopulateSchoolInspections } from './populateSchoolInspections'

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
        <div style={{ marginTop: '2rem', padding: '1rem', border: '2px dashed #ccc', borderRadius: 8 }}>
            <h4>🧪 Test Data Generator</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Generate sample school inspection data for all schools in the system.
            </p>
            
            {loading && (
                <div style={{ margin: '1rem 0' }}>
                    <CircularLoader small />
                    <p>Populating school inspections... This may take a few minutes.</p>
                </div>
            )}
            
            {result && !result.error && (
                <div style={{ margin: '1rem 0', padding: '1rem', background: '#e8f5e9', borderRadius: 4 }}>
                    <strong>✅ Population Complete!</strong>
                    <ul>
                        <li>Total schools: {result.total}</li>
                        <li>Successful: {result.success}</li>
                        <li>Errors: {result.errors}</li>
                    </ul>
                </div>
            )}
            
            {result?.error && (
                <div style={{ margin: '1rem 0', padding: '1rem', background: '#ffebee', borderRadius: 4 }}>
                    <strong>❌ Error:</strong> {result.error}
                </div>
            )}
            
            <Button onClick={handleClick} disabled={loading}>
                {loading ? 'Populating...' : 'Populate All Schools'}
            </Button>
        </div>
    )
}
