import { RemoveCircleOutline } from '@mui/icons-material'
import { Button, FormControl, Input, MenuItem, Select } from '@mui/material'
import { Box } from '@mui/system'
import React, { useCallback, useEffect, useState } from 'react'
import { useRef } from 'react'
import { PurchaseOrderApi } from '../../features/api'
import { useItemsApi } from '../../features/hooks'
import { useItemStore } from '../../features/store'

const ItemsSelect = ({ name, id = null }) => {
    const { rows } = useItemsApi()

    return (
        // eslint-disable-next-line jsx-a11y/control-has-associated-label
        <FormControl fullWidth>
            <Select defaultValue='' name={name} id={id || ''}>
                {rows.map(el => ({ value: el.url, text: el.name })).map((el, idx) => <MenuItem key={idx} value={el.value}>{el.text}</MenuItem>)}
            </Select>
        </FormControl>
    )
}

const ItemRow = ({ onClickRemove }) => (
    <Box display="flex" gap="1rem">
        <ItemsSelect name="item[]" />
        <Input name="count[]" type="number" inputProps={{ min: 1 }} />
        <Button onClick={onClickRemove} color="error"><RemoveCircleOutline /></Button>
    </Box>
)

const PurchaseOrderForm = () => {
    const selectContainerRef = useRef(null) // For scoping eventListeners to this specific form.
    const selectAccumulator = useRef(0)
    const [selectArr, setSelectArr] = useState([])
    const clearFetch = useItemStore(s => s.clearFetch)

    const handleSubmit = useCallback(e => {
        e.preventDefault()
        const elements = e.target.elements
        const getElements = key => elements[key] instanceof HTMLElement
            ? [elements[key]]
            : Array.from(elements[key])
        const counts = getElements('count[]').map(el => Number(el.value))
        const items = getElements('item[]').map(el => el.value)
        let item_quantity_arr = []
        items.forEach((el, idx) => item_quantity_arr.push({ [el]: counts[idx] }))
        if (item_quantity_arr.length > 0)
            PurchaseOrderApi.create(item_quantity_arr)
    }, [])

    const handleRemoveItem = useCallback(e => {
        e.stopPropagation()
        const newSelectArr = selectArr.filter(el => e.detail.idx !== Number(el.key))
        setSelectArr(newSelectArr)
    }, [selectArr, setSelectArr])

    const handleAddItem = useCallback(e => {
        const selectContainer = selectContainerRef.current
        const dispatchRemoveItem = idx => selectContainer.dispatchEvent(new CustomEvent('serp-removeItem', { detail: { idx: idx } }))
        const newSelectArr = [...selectArr]
        const key = selectAccumulator.current++
        newSelectArr.push(<ItemRow key={key} onClickRemove={() => dispatchRemoveItem(key)} />)
        setSelectArr(newSelectArr)
    }, [selectArr, setSelectArr])

    // Listen for the itemSelect removal event
    useEffect(() => {
        const selectContainer = selectContainerRef.current
        selectContainer.addEventListener('serp-removeItem', handleRemoveItem)
        return () => selectContainer.removeEventListener('serp-removeItem', handleRemoveItem)
    })

    useEffect(() => { clearFetch() }, [clearFetch])

    return (
        <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap="1rem">
                <Button onClick={handleAddItem} className="w-full" type="button" variant="contained" color="success">Add Item</Button>
                <Box ref={selectContainerRef} display="flex" flexDirection="column" gap="1rem">
                    {selectArr}
                </Box>
                <Button className="w-full" type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
        </form>
    )
}

export default PurchaseOrderForm