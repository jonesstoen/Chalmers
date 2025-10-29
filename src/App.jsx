import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { OrganisationUnitTree } from '@dhis2/ui'
import { useOrgUnitTree } from "./services/api/treeAPI"
import classes from './App.module.css'
import './locales'

const query = {
    me: { resource: 'me' },
}

const MyApp = () => {
    const { error, loading, data } = useDataQuery(query)
    const { roots, selected, initiallyExpanded, handleChange } = useOrgUnitTree({
        rootIds: ['Bp3y61WbHwn','RlPlK44dtoo'],
        singleSelection: false,
    })

    if (error) return <span>{i18n.t('ERROR')}</span>
    if (loading) return <span>{i18n.t('Loading...')}</span>

    return (
        <div className={classes.container}>
            <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
            <h3>{i18n.t('Select organisation units')}</h3>

            <OrganisationUnitTree
                roots={roots}
                selected={selected}
                initiallyExpanded={initiallyExpanded}
                onChange={handleChange}
                singleSelection={false}
            />

            {/* <pre>Selected IDs: {JSON.stringify(selected, null, 2)}</pre> */}
        </div>
    )
}

export default MyApp
