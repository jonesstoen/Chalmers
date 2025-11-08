import React, { useState, useCallback, useEffect } from 'react'
import { OrganisationUnitTree } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import classes from '../App.module.css'

export default function OrgTreePanel({ roots, initialRootId, onRootChange, onSelect }) {
    const [currentRootId, setCurrentRootId] = useState(initialRootId ?? roots[0].id)
    const [expanded, setExpanded] = useState([`/${currentRootId}`])
    const [selected, setSelected] = useState([])

    // Normaliser input fra tree (kan være string, array, eller objekt med path)
    const asPaths = (arg) => {
        if (!arg) return []
        if (Array.isArray(arg)) return arg
        if (typeof arg === 'string') return [arg]
        if (arg.path) return [arg.path]
        return []
    }

    const handleExpand = useCallback((arg) => {
        const add = asPaths(arg)
        setExpanded((prev) => {
            const s = new Set(prev)
            add.forEach((p) => p && s.add(p))
            return Array.from(s)
        })
    }, [])

    const handleCollapse = useCallback((arg) => {
        const remove = new Set(asPaths(arg))
        setExpanded((prev) => prev.filter((p) => !remove.has(p)))
    }, [])

    // Bytte rot
    const switchRoot = (id) => {
        setCurrentRootId(id)
        setExpanded([`/${id}`])
        setSelected([])
        onRootChange?.(id)
        onSelect?.([]) // informer App om at ingenting er valgt
    }

    // Velge node
    const handleChange = useCallback(
        (value) => {
            let ids = []
            if (Array.isArray(value)) ids = value.map((n) => n?.id).filter(Boolean)
            else if (value?.id) ids = [value.id]
            else if (value && typeof value === 'object') ids = Object.keys(value).map((p) => p.replace('/', ''))

            const next = ids.length ? [ids[0]] : []
            setSelected(next)
            onSelect?.(next)
        },
        [onSelect]
    )

    useEffect(() => {
        onRootChange?.(currentRootId)
    }, [currentRootId, onRootChange])

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
                                background: '#fff',
                                padding: '6px 10px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                boxShadow: currentRootId === r.id ? '0 0 0 2px rgba(37,99,235,.15)' : 'none',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={classes.treeScroll}>
                <OrganisationUnitTree
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