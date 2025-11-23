// pages/SchoolInspectionPage/components/OrgTreePanel.jsx
import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react'
import { OrganisationUnitTree } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import classes from '../../../App/App.module.css'

const OrgTreePanel = forwardRef(function OrgTreePanel({ roots, initialRootId, onRootChange, onSelect }, ref) {
    const safeInitialRoot = initialRootId ?? roots?.[0]?.id

    // --------------------------
    // 1. State declarations
    // --------------------------
    const [currentRootId, setCurrentRootId] = useState(safeInitialRoot)
    const [pendingSelect, setPendingSelect] = useState(null)
    const [expanded, setExpanded] = useState(() =>
        safeInitialRoot ? [`/${safeInitialRoot}`] : []
    )
    const [selectedPaths, setSelectedPaths] = useState([])

    // --------------------------
    // 2. Scroll to selected node
    // --------------------------
    useEffect(() => {
        if (!selectedPaths.length) return
        const id = selectedPaths[0].split('/').pop()
        const selector = `[data-test="dhis2-uiwidgets-orgunittree-node-${id}"]`

        setTimeout(() => {
            const el = document.querySelector(selector)
            if (el) {
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
            }
        }, 50)
    }, [selectedPaths])

    // ----------------------------------------------------
    // 3. Apply pending selection AFTER switching root
    // ----------------------------------------------------
    useEffect(() => {
        if (!pendingSelect) return
        if (!currentRootId) return

        requestAnimationFrame(() => {
            const unit = pendingSelect
            const fullSegs = unit.path.split('/').filter(Boolean)

            const startIndex = fullSegs.indexOf(currentRootId)
            if (startIndex === -1) return

            const localSegs = fullSegs.slice(startIndex)

            const parentPaths = localSegs.map(
                (_, i) => "/" + localSegs.slice(0, i + 1).join("/")
            )
            const selectedPath = "/" + localSegs.join("/")

            setExpanded(prev => {
                const merged = new Set(prev)
                parentPaths.forEach(p => merged.add(p))
                return Array.from(merged)
            })

            setSelectedPaths([selectedPath])
            onSelect?.([unit.id])
            setPendingSelect(null)
        })
    }, [pendingSelect, currentRootId, onSelect])

    // --------------------------
    // Helper functions
    // --------------------------
    const asPaths = (arg) => {
        if (!arg) return []
        if (Array.isArray(arg)) return arg
        if (typeof arg === 'string') return [arg]
        if (arg.path) return [arg.path]
        if (arg.id) return [`/${arg.id}`]
        return []
    }

    const pathToId = (p) => {
        const segs = String(p || '').split('/').filter(Boolean)
        return segs[segs.length - 1] || null
    }

    // --------------------------
    // 4. Tree expand/collapse
    // --------------------------
    const handleExpand = useCallback((arg) => {
        const add = asPaths(arg)
        setExpanded(prev => {
            const s = new Set(prev)
            add.forEach(p => p && s.add(p))
            return Array.from(s)
        })
    }, [])

    const handleCollapse = useCallback((arg) => {
        const remove = new Set(asPaths(arg))
        setExpanded(prev => prev.filter(p => !remove.has(p)))
    }, [])

    const switchRoot = (id) => {
        setCurrentRootId(id)
        setExpanded([`/${id}`])
        setSelectedPaths([])
        onRootChange?.(id)
        onSelect?.([]) // reset
    }

    // --------------------------
    // 5. Tree selection handler
    // --------------------------
    const handleChange = useCallback((value) => {
        const paths = asPaths(value).map(p =>
            p.startsWith('/') ? p : `/${p}`
        )
        const next = paths.length ? [paths[paths.length - 1]] : []
        setSelectedPaths(next)

        const id = next.length ? pathToId(next[0]) : null
        onSelect?.(id ? [id] : [])
    }, [onSelect])

    // --------------------------
    // 6. Search selection handler
    // --------------------------
    const handleSearchPick = useCallback((unit) => {
        if (!unit?.path) return

        const fullSegs = unit.path.split('/').filter(Boolean)
        const rootObj = roots.find(r => fullSegs.includes(r.id))
        if (!rootObj) return

        const rootId = rootObj.id

        // Switch root first if needed
        if (rootId !== currentRootId) {
            setPendingSelect(unit)
            switchRoot(rootId)
            return
        }

        // Apply selection directly
        const startIndex = fullSegs.indexOf(rootId)
        const localSegs = fullSegs.slice(startIndex)

        const parentPaths = localSegs.map(
            (_, i) => "/" + localSegs.slice(0, i + 1).join("/")
        )
        const selectedPath = "/" + localSegs.join("/")

        setExpanded(prev => {
            const merged = new Set(prev)
            parentPaths.forEach(p => merged.add(p))
            return Array.from(merged)
        })

        setSelectedPaths([selectedPath])
        onSelect?.([unit.id])
    }, [roots, currentRootId, onSelect])

    // Expose handleSearchPick via ref
    useImperativeHandle(ref, () => ({
        handleSearchPick,
    }), [handleSearchPick])

    // Notify root change
    useEffect(() => {
        if (currentRootId) onRootChange?.(currentRootId)
    }, [currentRootId, onRootChange])

    // --------------------------
    // 7. Render
    // --------------------------
    if (!currentRootId) {
        return (
            <aside className={classes.sidebar}>
                <div className={classes.sidebarHeader}>
                    {i18n.t('Organisation units')}
                </div>
                <div style={{ padding: 8, color: '#6b7280' }}>
                    {i18n.t('No roots available')}
                </div>
            </aside>
        )
    }

    return (
        <aside className={classes.sidebar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 6px 10px 6px' }}>
                <div className={classes.sidebarHeader}>
                    {i18n.t('Organisation units')}
                </div>
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
                                boxShadow: currentRootId === r.id
                                    ? '0 0 0 2px rgba(37,99,235,.15)'
                                    : 'none',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={classes.treeScroll}>
                <OrganisationUnitTree
                    key={currentRootId}
                    roots={[currentRootId]}
                    selected={selectedPaths}
                    expanded={expanded}
                    singleSelection
                    onChange={handleChange}
                    handleExpand={handleExpand}
                    handleCollapse={handleCollapse}
                />
            </div>
        </aside>
    )
})

export default OrgTreePanel
