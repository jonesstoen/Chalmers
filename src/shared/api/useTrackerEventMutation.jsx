import {
    useDataMutation,
    useDhis2ConnectionStatus,
    useOnlineStatus,
} from "@dhis2/app-runtime"
import { useMemo, useCallback } from "react"
import { outboxCache } from "../cache/config"

export default function usePostEvent(type = "POST") {
    const { isConnected } = useDhis2ConnectionStatus()
    const browserOnline = useOnlineStatus()
    const isOffline = !isConnected || !browserOnline

    const today = new Date().toISOString().split("T")[0]

    // DHIS2 requires a STATIC mutation with a DATA WRAPPER
    const STATIC_QUERY = useMemo(() => {
        return {
            resource: "tracker",
            type: "create",
            params: {
                async: false,
                importStrategy:
                    type === "POST"
                        ? "CREATE"
                        : type === "PUT"
                            ? "UPDATE"
                            : "DELETE",
            },
            // DHIS2 expects data: ({events}) => ({events})
            data: ({ events }) => ({ events }),
        }
    }, [type])

    const [onlineMutate, onlineState] = useDataMutation(STATIC_QUERY)

    const wrappedMutate = useCallback(
        async (vars) => {
            console.log("offline:", isOffline)

            // Build event payload OUTSIDE the mutation
            let events

            if (type === "POST") {
                events = [
                    {
                        program: vars.program_id,
                        programStage: vars.programStage,
                        orgUnit: vars.orgUnit_id,
                        occurredAt: `${vars.period ?? today}T00:00:00`,
                        status: vars.status ?? "COMPLETED",
                        dataValues: vars.dataValues,
                    },
                ]
            } else if (type === "PUT") {
                events = [
                    {
                        event: vars.eventId,
                        program: vars.program_id,
                        programStage: vars.programStage,
                        orgUnit: vars.orgUnit_id,
                        occurredAt: vars.occurredAt,
                        status: vars.status ?? "COMPLETED",
                        dataValues: vars.dataValues,
                    },
                ]
            } else {
                events = [{ event: vars.eventId }]
            }

            // ONLINE: send correct shape
            if (!isOffline) {
                console.log("POSTING ONLINE →", { events })
                return await onlineMutate({ events })
            }

            // OFFLINE: cache
            const cacheKey =
                type === "POST"
                    ? `event:${type}:${vars.program_id}:${vars.programStage}:${vars.orgUnit_id}:${vars.period ?? today}`
                    : `event:${type}:${vars.eventId}`
            await outboxCache.setItem(cacheKey, { type, events, ts: Date.now() })

            console.log("📦 stored offline:", cacheKey)

            return {
                offline: true,
                message: "Saved offline and will sync later.",
            }
        },
        [isOffline, onlineMutate, type, today]
    )

    return [wrappedMutate, onlineState]
}
