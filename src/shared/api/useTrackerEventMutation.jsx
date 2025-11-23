import {
    useDataMutation,
    useDhis2ConnectionStatus,
    useOnlineStatus,
} from "@dhis2/app-runtime";
import { useMemo, useCallback } from "react";
import { outboxCache } from "../cache/config";

export default function usePostEvent(type = "POST") {
    const browserOnline = useOnlineStatus();

    const isOffline = !browserOnline;
    const today = new Date().toISOString().split("T")[0];

    const CREATE = { resource: "tracker", type: "create", params: { async: false, importStrategy: "CREATE" } };
    const UPDATE = { resource: "tracker", type: "create", params: { async: false, importStrategy: "UPDATE" } };
    const DELETE = { resource: "tracker", type: "create", params: { async: false, importStrategy: "DELETE" } };

    const STATIC_QUERY = useMemo(() => {
        if (type === "POST") return CREATE;
        if (type === "PUT") return UPDATE;
        if (type === "DELETE") return DELETE;
        throw new Error("Invalid mutation type");
    }, [type]);

    const [onlineMutate, onlineState] = useDataMutation(STATIC_QUERY);

    const wrappedMutate = useCallback(
        async (variables) => {
            if (!isOffline) {
                const payload =
                    type === "POST"
                        ? {
                            events: [
                                {
                                    program: variables.program_id,
                                    programStage: variables.programStage,
                                    orgUnit: variables.orgUnit_id,
                                    occurredAt: `${variables.period ?? today}T00:00:00.000`,
                                    status: variables.status ?? "COMPLETED",
                                    dataValues: variables.dataValues,
                                },
                            ],
                        }
                        : type === "PUT"
                            ? {
                                events: [
                                    {
                                        event: variables.eventId,
                                        program: variables.program_id,
                                        programStage: variables.programStage,
                                        orgUnit: variables.orgUnit_id,
                                        occurredAt: variables.occurredAt,
                                        status: variables.status ?? "COMPLETED",
                                        dataValues: variables.dataValues,
                                    },
                                ],
                            }
                            : {
                                events: [{ event: variables.eventId }],
                            };

                return await onlineMutate({ data: payload });
            }

            const cacheKey =
                type === "POST"
                    ? `event:${type}:${variables.program_id}:${variables.programStage}:${variables.orgUnit_id}:${today}`
                    : `event:${type}:${variables.eventId}`;

            await outboxCache.setItem(cacheKey, {
                type,
                variables,
                timestamp: Date.now(),
            });

            return { offline: true, message: "Saved offline (outbox)." };
        },
        [isOffline, type, today, onlineMutate]
    );

    return [wrappedMutate, onlineState];
}
