import { Button, Dialog, DialogContent, DialogTitle, MenuItem, Select, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import { InventoryLotApi } from '../../features/api'
import { usePurchaseOrderStore } from '../../features/store'

const AddInventoryLotForm = ({ open, setOpen, items, purchaseOrderUrl }) => {
    const markChanged = usePurchaseOrderStore(s => s.markChanged)
    const handleSubmit = (e) => {
        e.preventDefault()
        const formInputs = e.target.elements
        const item = [...formInputs].filter(el => el.name === 'item').pop().value
        const quantity = [...formInputs].filter(el => el.name === 'quantity').pop().value
        const data = {
            purchase_order: purchaseOrderUrl,
            item: item,
            quantity: quantity,
        }

        console.log('submitting', data)

        InventoryLotApi.create(data)
            .then(() => markChanged())
            .then(() => setOpen(false))
    }

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <DialogTitle>Add Inventory Lot</DialogTitle>

            <DialogContent dividers>
                <form onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection="column" gap="0.5rem">
                        <Select name="item" defaultValue="">
                            {items.map((el, idx) => <MenuItem key={idx} value={el.item.url}>{el.item.name}</MenuItem>)}
                        </Select>
                        <TextField name="quantity" label="Quantity" type="number" defaultValue="0" />
                        <Box display="flex" gap="0.25rem">
                            <Button sx={{ flex: 1 }} color="error" variant="contained" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button sx={{ flex: 1 }} color="success" variant="contained" type="submit">Submit</Button>
                        </Box>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddInventoryLotForm