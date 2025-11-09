// home/PrioritySchoolCard.jsx
import React from 'react'

export default function PrioritySchoolCard({ name, district, status, onOpen }) {
    return (
        <div style={{ border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', padding:12 }}>
            <div style={{ fontWeight:700 }}>{name}</div>
            <div style={{ color:'#6b7280', fontSize:12 }}>{district}</div>
            <div style={{ marginTop:8 }}>{status}</div>
            <button onClick={onOpen} style={{ marginTop:10, padding:'6px 10px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer' }}>
                Inspect →
            </button>
        </div>
    )
}