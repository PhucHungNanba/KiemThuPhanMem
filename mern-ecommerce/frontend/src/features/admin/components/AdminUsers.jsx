import React, { useEffect } from 'react'
import { Box, Button, Paper, Stack, Typography, useTheme } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { getAllUsersAsync, selectUsers, selectUsersFetchStatus, selectUserToggleStatus, toggleUserStatusAsync } from '../../user/UserSlice'
import { toast } from 'react-toastify'
import Lottie from 'lottie-react'
import { loadingAnimation } from '../../../assets'

export const AdminUsers = () => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const users = useSelector(selectUsers)
  const usersFetchStatus = useSelector(selectUsersFetchStatus)
  const userToggleStatus = useSelector(selectUserToggleStatus)

  useEffect(() => {
    dispatch(getAllUsersAsync(true))
  }, [dispatch])

  useEffect(() => {
    if (userToggleStatus === 'fulfilled') {
      toast.success("User status updated successfully")
    } else if (userToggleStatus === 'rejected') {
      toast.error("Failed to update user status")
    }
  }, [userToggleStatus])

  const handleToggleStatus = (userId) => {
    dispatch(toggleUserStatusAsync(userId))
  }

  const columns = [
    {
      field: '_id', headerName: 'ID', minWidth: 220, flex: 1, renderCell: (params) => (
        <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{params.value}</Typography>
      )
    },
    {
      field: 'name', headerName: 'Name', minWidth: 170, flex: 1, renderCell: (params) => (
        <Typography sx={{ whiteSpace: 'normal' }}>{params.value}</Typography>
      )
    },
    {
      field: 'email', headerName: 'Email', minWidth: 200, flex: 1.5, renderCell: (params) => (
        <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{params.value}</Typography>
      )
    },
    {
      field: 'isEnabled', headerName: 'Status', minWidth: 120, flex: 0.6,
      renderCell: (params) => (
        <Typography color={params.row.isEnabled ? 'green' : 'error'}>
          {params.row.isEnabled ? 'Enabled' : 'Disabled'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 160,
      flex: 0.8,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.row.isEnabled ? 'error' : 'success'}
          onClick={() => handleToggleStatus(params.row._id)}
        >
          {params.row.isEnabled ? 'Disable' : 'Enable'}
        </Button>
      ),
    },
  ]

  if (usersFetchStatus === 'pending') {
    return (
      <Stack width={'100%'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
        <Box width={'25rem'}>
          <Lottie animationData={loadingAnimation} />
        </Box>
      </Stack>
    )
  }

  return (
    <Stack p={3}>
      <Paper elevation={3} sx={{ height: 'calc(100vh - 6rem)', width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': { whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2', py: 1 },
            '& .MuiDataGrid-columnHeaderTitle': { whiteSpace: 'normal' },
            '& .MuiDataGrid-row': { alignItems: 'flex-start' }
          }}
        />
      </Paper>
    </Stack>
  )
}
