import { useMemo } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
// https://research.im.dhis2.org/in5320g09/api/dataSets/x0V4c4DxJHE?fields=dataSetElements[dataElement[id,name,domainType,valueType]]
// Baseline survey data that we will use for reference exists for up to 2024 and can be found in the “EMIS - Primary Tool” data set (uid x0V4c4DxJHE)
// i dont know if we are using this

export default function useFetchDatasets() {
    const query = useMemo(() => ({
        dataSets: { resource: 'dataSets', params: { fields: ['*'] } },
    }), [])
    return useDataQuery(query)   // nå er query statisk
}