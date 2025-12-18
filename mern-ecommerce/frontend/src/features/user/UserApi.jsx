import { axiosi } from "../../config/axios"

export const fetchLoggedInUserById=async(id)=>{
    try {
        const res=await axiosi.get(`/users/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const updateUserById=async(update)=>{
    try {
        const res=await axiosi.patch(`/users/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const getAllUsers=async()=>{
    try {
        const res=await axiosi.get('/users')
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const getAllUsersExcludingAdmins=async()=>{
    try {
        const res=await axiosi.get('/users?excludeAdmins=true')
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const toggleUserStatus=async(userId)=>{
    try {
        const res=await axiosi.patch(`/users/${userId}/toggle-status`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}