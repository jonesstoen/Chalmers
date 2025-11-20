// src/cache/config.ts
import localforage from 'localforage'

// Configure a default store
localforage.config({
    name: 'chalmers',
    storeName: 'default_cache',
    description: 'Offline cache for analytics and inspection data',
})

// You can also make specific instances if you prefer:
export const dataCache = localforage.createInstance({
    name: 'chalmers',
    storeName: 'data_cache',
})

export const outboxCache = localforage.createInstance({
    name: 'chalmers',
    storeName: 'outbox_cache',
})

export default localforage