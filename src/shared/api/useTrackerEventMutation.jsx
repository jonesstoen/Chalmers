import { useDataMutation } from "@dhis2/app-runtime"
import { useMemo, useCallback } from "react"
import { outboxCache } from "../cache/config"
import {useOfflineDetector} from "../cache/useOfflineDetector";
import {useBypassLocalhostOfflineDetector} from "../cache/useBypassLocalhostOfflineDetector";

export default function usePostEvent(type = "POST") {
    const isActualOffline = useOfflineDetector()
    const isBypassOffline = useBypassLocalhostOfflineDetector()
    const isOffline = isActualOffline || isBypassOffline

    const today = new Date().toISOString().split("T")[0]

    const STATIC_QUERY = useMemo(() => ({
        resource: "tracker",
        type: "create",
        params: {
            async: false,
            importStrategy:
                type === "POST" ? "CREATE" :
                    type === "PUT"  ? "UPDATE" :
                        "DELETE",
        },
        data: ({ events }) => ({ events }),
    }), [type])

    const [onlineMutate, onlineState] = useDataMutation(STATIC_QUERY)

    const wrappedMutate = useCallback(
        async (vars) => {
            let events

            if (type === "POST") {
                events = [{
                    program: vars.program_id,
                    programStage: vars.programStage,
                    orgUnit: vars.orgUnit_id,
                    occurredAt: `${vars.period ?? today}T00:00:00`,
                    status: vars.status ?? "COMPLETED",
                    dataValues: vars.dataValues,
                }]
            } else if (type === "PUT") {
                events = [{
                    event: vars.eventId,
                    program: vars.program_id,
                    programStage: vars.programStage,
                    orgUnit: vars.orgUnit_id,
                    occurredAt: vars.occurredAt,
                    status: vars.status ?? "COMPLETED",
                    dataValues: vars.dataValues,
                }]
            } else {
                events = [{ event: vars.eventId }]
            }

            // Attempt online submission first
            if (!isOffline) {
                try {
                    console.log(" ONLINE submit →", events)
                    const result = await onlineMutate({ events })
                    return {
                        ...result,
                        isOnline: true,
                    }
                } catch (err) {
                    console.warn("💥 Online submit FAILED — treating as offline:", err)
                }
            }

            // offline fallback
            // For DELETE operations, dont allow offline deletion
            if (type === "DELETE") {
                return {
                    offline: true,
                    isOnline: false,
                    message: "Cannot delete when offline. Try again later",
                }
            }

            const cacheKey =
                type === "POST"
                    ? `event:${type}:${vars.program_id}:${vars.programStage}:${vars.orgUnit_id}:${vars.period ?? today}`
                    : `event:${type}:${vars.eventId}`

            await outboxCache.setItem(cacheKey, {
                type,
                events,
                ts: Date.now(),
            })

            console.log("📦 Saved offline:", cacheKey)

            return {
                offline: true,
                isOnline: false,
                message: "You are offline. Your request has been stored, and will be posted when back online. No comparison available",
            }
        },
        [isOffline, onlineMutate, type, today]
    )

    return [wrappedMutate, onlineState]
}
