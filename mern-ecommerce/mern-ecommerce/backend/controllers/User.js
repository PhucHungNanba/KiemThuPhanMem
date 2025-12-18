const User=require("../models/User")

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=(await User.findById(id)).toObject()
        delete result.password
        res.status(200).json(result)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}
exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=(await User.findByIdAndUpdate(id,req.body,{new:true})).toObject()
        delete updated.password
        res.status(200).json(updated)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}
exports.getAll=async(req,res)=>{
    try {
        const excludeAdmins = req.query.excludeAdmins === 'true'
        const filter = excludeAdmins ? { isAdmin: { $ne: true } } : {}
        const users=await User.find(filter).lean()
        const sanitized=users.map(u=>{ delete u.password; return u })
        res.status(200).json(sanitized)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching users'})
    }
}

exports.toggleStatus=async(req,res)=>{
    try {
        const {id}=req.params
        const user=await User.findById(id)
        if(!user) return res.status(404).json({message:'User not found'})
        user.isEnabled = !user.isEnabled
        const updated=await user.save()
        const obj=updated.toObject()
        delete obj.password
        res.status(200).json(obj)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error toggling user status'})
    }
}