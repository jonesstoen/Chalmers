import InspectionInput from "./Inspection"
import { CircularLoader } from '@dhis2/ui'
import React, { useState } from 'react'


// SubFunctions are not implemented
function InspectionForm(){
    // Defaults to post for creating events
    const [type, setType] = useState('create')
    // const [mutation, {called, loading, error, data}] = usePostEvent(type)

    // Components inside TODO
    return ( <div>
        <InspectionInput type={type} setType={setType} mutation={mutation}/>
        {data && <MutationResponse/>}
        {loading && <CircularLoader/>}
        {error && <Error/>}
    </div>)
}



export default InspectionForm