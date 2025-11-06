

// SubFunctions are not implemented
function InspectionForm(){
    // Defaults to post for creating events
    const [type, setType] = useState('')
    const [mutation, {called, loading, error, data}] = usePostEvent(type)



    // Components inside TODO
    return ( <div>
        <Inspection type={type} setType={setType} mutation={mutation}/>
        {data && <MutationResponse/>}
        {loading && <Loading/>}
        {error && <Error/>}
    </div>)
}



export default InspectionForm