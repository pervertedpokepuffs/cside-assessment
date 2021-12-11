import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { Collapse, Dialog, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import { Box } from '@mui/system'
import React, { Fragment, useEffect, useState } from 'react'
import { PurchaseOrderApi } from "../../features/api"

const ItemRow = ({ itemDetail, inventoryLots }) => {
    const [open, setOpen] = useState(false)
    const inventoryLot_arr = inventoryLots?.filter(el => el.item === itemDetail.item.url)

    return (
        <Fragment>
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>{itemDetail?.item.name}</TableCell>
                <TableCell>{itemDetail?.quantity}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Lots
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Lot No.</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell align="right">Created At</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventoryLot_arr.map((el, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell component="th" scope="row">{el.lot_number}</TableCell>
                                            <TableCell>{el.quantity}</TableCell>
                                            <TableCell align="right">{el.created_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    )
}

const PurchaseOrderDetail = ({ url, open, setOpen }) => {
    const [orderDetail, setOrderDetail] = useState(null)

    useEffect(() => {
        PurchaseOrderApi.find(url)
            .then(res => setOrderDetail(res))
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const TitleContent = ({ title, children }) => (
        <Box display="flex" flexDirection="column">
            <Typography variant="h5">{title}</Typography>
            {children}
        </Box>
    )

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            scroll="paper"
        >
            <DialogTitle>Item {orderDetail?.uuid}</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap="0.25rem">
                    <TitleContent title="UUID">{orderDetail?.uuid || 'N/A'}</TitleContent>
                    <TitleContent title="Status">{orderDetail?.status || 'N/A'}</TitleContent>
                    <TitleContent title="Created At">{orderDetail?.created_at || 'N/A'}</TitleContent>
                    <TitleContent title="Items">
                        {
                            orderDetail?.items?.length === 0
                                ? 'N/A'
                                : (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell>Item</TableCell>
                                                <TableCell>Quantity</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                orderDetail?.items?.map((el, idx) => (
                                                    <ItemRow key={idx} itemDetail={el} inventoryLots={orderDetail?.inventory_lots} />
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                )
                        }
                    </TitleContent>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default PurchaseOrderDetail