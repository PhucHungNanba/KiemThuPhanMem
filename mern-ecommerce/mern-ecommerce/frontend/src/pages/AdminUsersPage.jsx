import React from 'react'
import { AdminUsers } from '../features/admin/components/AdminUsers'
import {Navbar} from '../features/navigation/components/Navbar'

export const AdminUsersPage = () => {
  return (
    <>
    <Navbar/>
    <AdminUsers/>
    </>
  )
}
