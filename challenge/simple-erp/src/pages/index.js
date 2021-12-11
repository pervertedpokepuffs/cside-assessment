import { Button, Menu, Typography } from '@mui/material'
import { Box } from "@mui/system"
import React, { useState } from 'react'
import Layout from "../components/layout"
import PurchaseOrderForm from '../components/purchase-order-form'
import PurchaseOrderTable from '../components/purchase-order-table'

const IndexPage = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClickCreate = e => setAnchorEl(e.target)
  const handleClose = () => setAnchorEl(null)

  return (
    <Layout>
      <Box>
        <Button onClick={handleClickCreate} sx={{ width: '100%' }} variant="outlined">Create</Button>
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={open}
          onClose={handleClose}
        >
          <Box width='50vw' padding="1rem" display="flex" gap="0.25rem" flexDirection="column">
            <Typography variant="h4">Create new purchase order</Typography>
            <PurchaseOrderForm />
          </Box>
        </Menu>
        <PurchaseOrderTable />
      </Box>
    </Layout>
  )
}

export default IndexPage
