import localforage from "localforage"
import { outboxEvents } from "./outboxEvents"

localforage.config({
    name: "chalmers",
    storeName: "default_cache",
    description: "Offline cache for analytics and inspection data",
})

export const dataCache = localforage.createInstance({
    name: "chalmers",
    storeName: "data_cache",
})

export const outboxCache = localforage.createInstance({
    name: "chalmers",
    storeName: "outbox_cache",
})


// Patch function — wraps final driver methods
function patchOutboxCache(cache) {
    console.log("[Outbox] Applying monkey patch…")

    const originalSetItem = cache.setItem.bind(cache)
    const originalRemoveItem = cache.removeItem.bind(cache)
    const originalClear = cache.clear.bind(cache)

    cache.setItem = async (key, value) => {
        const res = await originalSetItem(key, value)
        console.log("[Outbox] PATCHED setItem:", key)
        outboxEvents.emit("changed", { type: "set", key })
        return res
    }

    cache.removeItem = async (key) => {
        const res = await originalRemoveItem(key)
        console.log("[Outbox] PATCHED removeItem:", key)
        outboxEvents.emit("changed", { type: "remove", key })
        return res
    }

    cache.clear = async () => {
        const res = await originalClear()
        console.log("[Outbox] PATCHED clear()")
        outboxEvents.emit("changed", { type: "clear" })
        return res
    }
}

// Patch for every placeholder created
outboxCache.ready().then(() => {
    console.log("[Outbox] ready() → instance initialized")
    patchOutboxCache(outboxCache)
})

console.log("[Outbox] config.ts loaded")

export default localforage
