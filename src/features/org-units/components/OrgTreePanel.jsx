import React, { useState, useCallback, useEffect } from 'react'
import { OrganisationUnitTree } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import classes from '../../../App/App.module.css'
import SchoolSearchBar from '../../inspections/components/SchoolSearchBar.jsx'

export default function OrgTreePanel({ roots, initialRootId, onRootChange, onSelect }) {
    const safeInitialRoot = initialRootId ?? roots?.[0]?.id
    const [currentRootId, setCurrentRootId] = useState(safeInitialRoot)
    const [expanded, setExpanded] = useState(() => (safeInitialRoot ? [`/${safeInitialRoot}`] : []))
    const [selected, setSelected] = useState([])

    const asPaths = (arg) => {
        if (!arg) return []
        if (Array.isArray(arg)) return arg
        if (typeof arg === 'string') return [arg]
        if (arg.path) return [arg.path]
        return []
    }
    const pathToId = (p) => {
        const segs = String(p || '').split('/').filter(Boolean)
        return segs[segs.length - 1] || null
    }

    const handleExpand = useCallback((arg) => {
        const add = asPaths(arg)
        setExpanded((prev) => {
            const s = new Set(prev); add.forEach((p) => p && s.add(p)); return Array.from(s)
        })
    }, [])

    const handleCollapse = useCallback((arg) => {
        const remove = new Set(asPaths(arg))
        setExpanded((prev) => prev.filter((p) => !remove.has(p)))
    }, [])

    const switchRoot = (id) => {
        setCurrentRootId(id)
        setExpanded([`/${id}`])
        setSelected([])
        onRootChange?.(id)
        onSelect?.([])        // reset oppover
    }

    // <- Viktig: bruk SISTE id fra tree selection
    const handleChange = useCallback((value) => {
        let ids = []
        if (Array.isArray(value)) {
            ids = value.map((n) => (typeof n === 'string' ? pathToId(n) : n?.id ?? pathToId(n?.path))).filter(Boolean)
        } else if (value && typeof value === 'object') {
            if (value.id) ids = [value.id]
            else if (value.path) ids = [pathToId(value.path)]
            else ids = Object.keys(value).map(pathToId).filter(Boolean) // map-format
        } else if (typeof value === 'string') {
            ids = [pathToId(value)].filter(Boolean)
        }
        const last = ids.length ? ids[ids.length - 1] : null
        const next = last ? [last] : []
        setSelected(next)
        onSelect?.(next)
    }, [onSelect])

    // ← Koble søk til seleksjon (du hadde `regionid` her før — den gjorde ingenting)
    const handleSearchPick = useCallback((school) => {
        if (!school?.id) return
        setSelected([school.id])
        onSelect?.([school.id])
    }, [onSelect])

    useEffect(() => { if (currentRootId) onRootChange?.(currentRootId) }, [currentRootId, onRootChange])

    if (!currentRootId) {
        return (
            <aside className={classes.sidebar}>
                <div className={classes.sidebarHeader}>{i18n.t('Organisation units')}</div>
                <div style={{ padding: 8, color: '#6b7280' }}>{i18n.t('No roots available')}</div>
            </aside>
        )
    }

    return (
        <aside className={classes.sidebar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 6px 10px 6px' }}>
                <div className={classes.sidebarHeader}>{i18n.t('Organisation units')}</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {roots.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => switchRoot(r.id)}
                            style={{
                                border: '1px solid ' + (currentRootId === r.id ? '#2563eb' : '#e5e7eb'),
                                background: '#fff', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                                boxShadow: currentRootId === r.id ? '0 0 0 2px rgba(37,99,235,.15)' : 'none',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* NY: faktisk wiring */}
            <SchoolSearchBar onSelect={handleSearchPick} />

            <div className={classes.treeScroll}>
                <OrganisationUnitTree
                    key={currentRootId}
                    roots={[currentRootId]}
                    selected={selected}
                    expanded={expanded}
                    singleSelection
                    onChange={handleChange}
                    handleExpand={handleExpand}
                    handleCollapse={handleCollapse}
                />
            </div>
        </aside>
    )
}