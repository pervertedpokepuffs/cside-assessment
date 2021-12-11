import { useCallback } from "react"
import { useRef } from "react"
import { useEffect } from "react"
import { useItemStore, usePurchaseOrderStore } from "./store"

const createUseApiHook = useStore => () => {
    const [fetch, clearFetch] = useStore(s => [s.fetch, s.clearFetch])
    const rows = useStore(s => s.rows)
    const totalRows = useStore(s => s.totalRows)
    const isFetching = useStore(s => s.isFetching)
    const isChanged = useStore(s => s.isChanged)
    const next = useStore(s => s.nextPage)
    const prev = useStore(s => s.prevPage)
    const paginationRef = useRef(null)
    paginationRef.current = [prev, next]

    // Disable next line lint as the effect should only run on mount.
    useEffect(() => {
        clearFetch()
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isChanged) {
            clearFetch()
            fetch()
        }
    }, [isChanged, clearFetch, fetch])

    const fetchNext = useCallback(() => {
        fetch(undefined, paginationRef.current[1])
    }, [paginationRef, fetch])
    const fetchPrev = useCallback(() => {
        fetch(undefined, paginationRef[0])
    }, [paginationRef, fetch])

    return {
        rows,
        totalRows,
        isFetching,
        clearFetch,
        fetchNext,
        fetchPrev,
    }
}

const usePurchaseOrderApi = createUseApiHook(usePurchaseOrderStore)
const useItemsApi = createUseApiHook(useItemStore)

export {
    usePurchaseOrderApi,
    useItemsApi
}