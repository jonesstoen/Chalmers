// home/MetricTile.js
import React from 'react'
export default function MetricTile({ title, value }) {
    return (
        <div style={{ border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', padding:12 }}>
            <div style={{ color:'#6b7280', fontSize:12 }}>{title}</div>
            <div style={{ fontSize:28, fontWeight:800 }}>{value}</div>
        </div>
    )
}