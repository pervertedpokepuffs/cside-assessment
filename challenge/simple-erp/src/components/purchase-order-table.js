import { AddCircleOutline, AssignmentTurnedIn, DoDisturb, Preview } from '@mui/icons-material'
import { Button } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'
import React, { Fragment, useCallback, useState } from 'react'
import { PurchaseOrderApi } from '../../features/api'
import { usePurchaseOrderApi } from '../../features/hooks'
import { usePurchaseOrderStore } from '../../features/store'
import AddInventoryLotForm from './add-inventory-lot-form'
import PurchaseOrderDetail from './purchase-order-detail'

const ActionButton = props => <Button sx={{ minWidth: 0 }} {...props}>{props.children}</Button>

const ActionCell = ({ row }) => {
    const markChanged = usePurchaseOrderStore(s => s.markChanged)
    const [openPreview, setOpenPreview] = useState(false)
    const [openLotForm, setOpenLotForm] = useState(false)

    console.log(row)

    const handleClickPreview = () => {
        setOpenPreview(true)
    }

    const handleClickApprove = () => {
        PurchaseOrderApi.approve(row.url)
            .finally(() => markChanged())
    }

    const handleClickReject = () => {
        PurchaseOrderApi.reject(row.url)
            .finally(() => markChanged())
    }

    const handleClickAddInventory = () => {
        setOpenLotForm(true)
    }

    return (
        <Fragment>
            <Box display="flex">
                <ActionButton onClick={handleClickPreview} title="Preview"><Preview /></ActionButton>
                {row.status === 'PENDING_APPROVAL' && <ActionButton onClick={handleClickApprove} title="Approve"><AssignmentTurnedIn /></ActionButton>}
                {(row.status !== 'REJECTED' && row.status !== 'RECEIVED') && <ActionButton onClick={handleClickReject} title="Reject"><DoDisturb /></ActionButton>}
                {row.status === 'PENDING_RECEIVE' && <ActionButton onClick={handleClickAddInventory} title="Add to Inventory Lot"><AddCircleOutline /></ActionButton>}
            </Box>
            <PurchaseOrderDetail open={openPreview} setOpen={setOpenPreview} url={row.url} />
            <AddInventoryLotForm open={openLotForm} setOpen={setOpenLotForm} items={row.items} purchaseOrderUrl={row.url} />
        </Fragment>
    )
}

const columns = [
    { field: 'uuid', headerName: 'UUID', flex: 6 },
    { field: 'created_at', headerName: 'Created At', flex: 1, minWidth: 100 },
    { field: 'status', headerName: 'Status', flex: 1, minWidth: 100 },
    {
        field: 'url', headerName: 'Action', flex: 1, minWidth: 50, renderCell: val => {
            const row = val.row
            return (
                <ActionCell row={row} />
            )
        }
    },
]

const PurchaseOrderTable = () => {
    const { rows, totalRows, isFetching, fetchNext, fetchPrev } = usePurchaseOrderApi()

    const [pageOptions, setPageOptions] = useState({
        index: 0,
        pageSize: 25,
    })

    const handlePageChange = useCallback(idx => {
        if (pageOptions.index > idx) fetchPrev()
        else fetchNext()
        setPageOptions({
            ...pageOptions,
            index: idx
        })
    }, [pageOptions, setPageOptions, fetchNext, fetchPrev])

    const handlePageSizeChange = useCallback(val => {
        setPageOptions({
            ...pageOptions,
            pageSize: val
        })
    }, [pageOptions, setPageOptions])

    return (
        <DataGrid
            autoHeight
            pageSize={pageOptions.pageSize}
            rows={rows}
            rowCount={totalRows}
            columns={columns}
            paginationMode="server"
            loading={isFetching}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
        />
    )
}

export default PurchaseOrderTable