// App/App.jsx
import React, { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from '../pages/LandingPage/LandingPage'
import InspectionContext from '../context/InspectionContext'
import AttributeContext from '../context/AttributeContext'
import SchoolInspectionPage from '../pages/SchoolInspectionPage/SchoolInspectionPage'
import {useOutboxSync} from "../shared/cache/useOutboxSync";
import '../shared/cache/config'


export default function App() {
    const [inspectionDict, setInspectionDict] = useState({})
    const [attributes, setAttributes] = useState({})
    useOutboxSync()

    useEffect(() => {
        console.log("Updated inspectionDict:", inspectionDict)
        }, [inspectionDict])

    return (
        <InspectionContext.Provider value={[inspectionDict, setInspectionDict]}>
        <AttributeContext.Provider value={[attributes, setAttributes]}>
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                {/* <Route path="/inspect" element={<InspectPage />} /> */}
                <Route path="/school-inspection" element={<SchoolInspectionPage />} />
                {/* fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
        </AttributeContext.Provider>
        </InspectionContext.Provider>
    )
}