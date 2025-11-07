import { useState, useEffect } from "react";
import { useConfig, useDataEngine } from "@dhis2/app-runtime";

const STUDENT_PROGRAM = "wQaiD2V27Dp";
const ENROLLMENT_STAGE = "Ni2qsy2WJn4";

export function useStudentCount(orgUnitId) {
    const { apiVersion } = useConfig();
    const engine = useDataEngine();
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orgUnitId) return;

        async function fetchCount() {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    stage: ENROLLMENT_STAGE,
                    filter: `ou:${orgUnitId}`,
                    ouMode: "DESCENDANTS",
                    measure: "COUNT",
                    totalPages: "true",
                    pageSize: "1",
                });

                const data = await engine.link.fetch(
                    `/api/${apiVersion}/analytics/events/query/${STUDENT_PROGRAM}?${params.toString()}`,
                    { method: "GET" }
                );

                const total = data?.metaData?.pager?.total ?? 0;
                setCount(total);
            } catch (err) {
                console.error("Failed to fetch student count:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchCount();
    }, [orgUnitId, engine, apiVersion]);

    return { count, loading, error };
}

// //
// import { useDataQuery } from "@dhis2/app-runtime";

// const STUDENT_PROGRAM = "wQaiD2V27Dp";
// const ENROLLMENT_STAGE = "Ni2qsy2WJn4";

// const query = {
//     result: {
//         resource: "analytics/events/query",
//         id: STUDENT_PROGRAM,
//         params: ({ orgUnitId }) => ({
//             stage: ENROLLMENT_STAGE,
//             filter: `ou:${orgUnitId}`,
//             ouMode: "DESCENDANTS",
//             measure: "COUNT",
//             totalPages: "true",
//             pageSize: "1",
//         }),
//     },
// };

// export function useStudentCount(orgUnitId) {
//     const { loading, error, data, refetch } = useDataQuery(query, { 
//         lazy: !orgUnitId, // don't run until orgUnitId is set
//         variables: { orgUnitId },
//     });

//     // Extract total count if available
//     const count = data?.result?.metaData?.pager?.total ?? null;

//     return {
//         count,
//         loading,
//         error,
//         refetch,
//     };
// }
