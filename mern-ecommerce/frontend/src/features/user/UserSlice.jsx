import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { fetchLoggedInUserById, getAllUsers, getAllUsersExcludingAdmins, toggleUserStatus, updateUserById } from './UserApi'

const initialState={
    status:"idle",
    userInfo:null,
    errors:null,
    successMessage:null,
    users: [],
    usersFetchStatus: 'idle',
    userToggleStatus: 'idle'
}

export const fetchLoggedInUserByIdAsync=createAsyncThunk('user/fetchLoggedInUserByIdAsync',async(id)=>{
    const userInfo=await fetchLoggedInUserById(id)
    return userInfo
})
export const updateUserByIdAsync=createAsyncThunk('user/updateUserByIdAsync',async(update)=>{
    const updatedUser=await updateUserById(update)
    return updatedUser
})

export const getAllUsersAsync=createAsyncThunk('user/getAllUsersAsync',async(excludeAdmins=false)=>{
    const users = excludeAdmins ? await getAllUsersExcludingAdmins() : await getAllUsers()
    return users
})

export const toggleUserStatusAsync=createAsyncThunk('user/toggleUserStatusAsync',async(userId)=>{
    const updatedUser=await toggleUserStatus(userId)
    return updatedUser
})

const userSlice=createSlice({
    name:"userSlice",
    initialState:initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchLoggedInUserByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(fetchLoggedInUserByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.userInfo=action.payload
            })
            .addCase(fetchLoggedInUserByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(updateUserByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(updateUserByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.userInfo=action.payload
            })
            .addCase(updateUserByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })
            
            .addCase(getAllUsersAsync.pending,(state)=>{
                state.usersFetchStatus='pending'
            })
            .addCase(getAllUsersAsync.fulfilled,(state,action)=>{
                state.usersFetchStatus='fulfilled'
                state.users=action.payload
            })
            .addCase(getAllUsersAsync.rejected,(state,action)=>{
                state.usersFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(toggleUserStatusAsync.pending,(state)=>{
                state.userToggleStatus='pending'
            })
            .addCase(toggleUserStatusAsync.fulfilled,(state,action)=>{
                state.userToggleStatus='fulfilled'
                state.users=state.users.map(user => 
                    user._id === action.payload._id ? action.payload : user
                )
            })
            .addCase(toggleUserStatusAsync.rejected,(state,action)=>{
                state.userToggleStatus='rejected'
                state.errors=action.error
            })
    }
})

// exporting selectors
export const selectUserStatus=(state)=>state.UserSlice.status
export const selectUserInfo=(state)=>state.UserSlice.userInfo
export const selectUserErrors=(state)=>state.UserSlice.errors
export const selectUserSuccessMessage=(state)=>state.UserSlice.successMessage
export const selectUsers=(state)=>state.UserSlice.users
export const selectUsersFetchStatus=(state)=>state.UserSlice.usersFetchStatus
export const selectUserToggleStatus=(state)=>state.UserSlice.userToggleStatus


export default userSlice.reducer