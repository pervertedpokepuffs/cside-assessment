import { Box } from "@mui/system"
import React from 'react'
import './layout.css'

const Layout = ({ children }) => (
        <Box sx={{
            padding: '2rem',
        }}>
            {children}
        </Box>
)

export default Layout