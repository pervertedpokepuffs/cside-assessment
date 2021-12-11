import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { ItemsApi, PurchaseOrderApi } from './api'

/**
 * @typedef {import('./api').ErpApi} ErpApi
*/

/**
 * @template T
 * @typedef {Object} Store<T>
 * @property {T[]} rows - Data from API.
 * @property {boolean} isFetching - Current fetch state.
 * @property {boolean} isChanged - True if dirty.
 * @property {number} totalRows - Total number of rows in the dataset.
 * @property {string} secondPage - Offset value of second page from API.
 * @property {string} prevPage - Offset value of previous page from API.
 * @property {string} nextPage - Offset value of next page from API.
 * @property {(pageSize?: number, url?: string) => void} fetch
 * @property {() => void} clear
 * @property {() => Promise<Object>} find
 * @property {() => void} clearFetch
 * @property {() => void} markChanged
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {string} id
 * @property {string} uuid
 * @property {string} created_at
 * @property {status} status
 * @property {string[]} item - Array of ids of item belonging to purchase order.
 * @property {string[]} inventory_lot - Array of ids of inventory lots belonging to purchase order.
 */

/**
 * @type Store<any>
 */
const baseStore = {
    rows: [], // Using set to remove any duplicate.
    totalRows: 0,
    isFetching: false,
    isChanged: false,
    secondPage: null,
    prevPage: null,
    nextPage: null,
}

/**
 * @param {Function} set 
 * @returns {() => void}
 */
const clearFn = set => () => { set(s => ({ ...s, ...baseStore })) }

const markChangedFn = set => () => { set({ isChanged: true }) }

/**
 * @param {Function} set 
 * @param {Function} get 
 * @param {ErpApi<any>} api 
 * @returns {(pageSize = 10) => void}
 */
const fetchFn = (set, get, api) => (pageSize = 25, url = null) => {
    if (get().isFetching) return undefined // Prevent multiple fetches.
    set({ isFetching: true })
    api.fetch(pageSize, url)
        .then(res => ({
            rows: res?.results,
            totalRows: res?.count || 0,
            prevPage: res?.previous,
            nextPage: res?.next,
        }))
        .then(res => {
            set(res)
            return res
        })
        .finally(() => {
            set({ isFetching: false, isChanged: false })
        })
}

/**
 * @param {Function} get 
 * @returns {() => Promise<Object>}
 */
const findFn = (get, api) => async id => {
    const filteredArr = [...get().rows].filter(el => id === el.id)
    if (filteredArr.length > 0) return filteredArr.pop()
    return await api.find(id)
}

/**
 * @param {any} set 
 * @param {any} get 
 * @returns {Store<PurchaseOrder>}
 */
const purchaseOrderStore = (set, get) => ({
    ...baseStore,
    clear: clearFn(set),
    find: findFn(get, PurchaseOrderApi),
    fetch: fetchFn(set, get, PurchaseOrderApi),
    clearFetch: () => { set({ isFetching: false }) },
    markChanged: markChangedFn(set),
})
const usePurchaseOrderStore = create(devtools(purchaseOrderStore, { name: 'purchase_order' }))

const itemStore = (set, get) => ({
    ...baseStore,
    clear: clearFn(set),
    find: findFn(get, ItemsApi),
    fetch: fetchFn(set, get, ItemsApi),
    clearFetch: () => { set({ isFetching: false }) },
    markChanged: markChangedFn(set),
})
const useItemStore = create(devtools(itemStore, { name: 'items' }))

export {
    usePurchaseOrderStore,
    useItemStore,
}
