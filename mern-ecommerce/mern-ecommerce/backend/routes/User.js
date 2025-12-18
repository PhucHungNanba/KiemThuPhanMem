const express=require("express")
const userController=require("../controllers/User")
const router=express.Router()

router
    .get("/", userController.getAll)
    .get("/:id",userController.getById)
    .patch("/:id",userController.updateById)
    .patch("/:id/toggle-status", userController.toggleStatus)

module.exports=router