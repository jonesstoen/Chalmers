// App/App.jsx
import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../features/home/LandingPage'
import InspectPage from '../features/inspections/inspectionPage'
import SchoolInspectionPage from '../features/inspections/pages/SchoolInspectionPage'

export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/inspect" element={<InspectPage />} />
                <Route path="/school-inspection" element={<SchoolInspectionPage />} />
                {/* fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    )
}