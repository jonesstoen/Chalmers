import { useState, useEffect } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

// Fetches seats, textbooks, and learners in one cycle per level
export function useResourceRatios(orgUnitId, period = "2024", levels) {
    const engine = useDataEngine();
    const [data, setData] = useState({
        ratios: {},        // results per label: { UBE, LBE, SSE }
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!orgUnitId || !levels?.length) return;

        const fetchAllData = async () => {
            try {
                const queries = levels.reduce((acc, level) => {
                    acc[level.label] = {
                        resource: "analytics.json",
                        params: {
                            dimension: [
                                `dx:${level.seatActualId},dx:${level.seatGoodId},dx:${level.textbookId},dx:${level.learnerId}`,
                                `pe:${period}`
                            ],
                            filter: `ou:${orgUnitId}`,
                            ouMode: "DESCENDANTS",
                        },
                    };
                    return acc;
                }, {});

                const responses = await engine.query(queries);

                const ratios = {};
                for (const level of levels) {
                    const rows = responses[level.label]?.rows || [];

                    const seatsActual = Number(rows.find(r => r[0] === level.seatActualId)?.[3] ?? 0);
                    const seatsGood = Number(rows.find(r => r[0] === level.seatGoodId)?.[3] ?? 0);
                    const textbooks = Number(rows.find(r => r[0] === level.textbookId)?.[3] ?? 0);
                    const learners = Number(rows.find(r => r[0] === level.learnerId)?.[3] ?? 0);

                    ratios[level.label] = {
                        seatToLearnerActual: learners ? seatsActual / learners : null,
                        seatToLearnerGood: learners ? seatsGood / learners : null,
                        textbookToLearner: learners ? textbooks / learners : null,
                        seatsActual,
                        seatsGood,
                        textbooks,
                        learners,
                    };
                }

                setData({ ratios, loading: false, error: null });
            } catch (error) {
                setData({ ratios: {}, loading: false, error });
            }
        };

        fetchAllData();
    }, [engine, orgUnitId, period, levels]);

    return data;
}
