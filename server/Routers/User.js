const express=require('express')
const UserRouter=express.Router()
const UserController=require('../controllers/User')
const auth=require('../middleware/Auth')

UserRouter.post('/Signup',UserController.signUp)
UserRouter.get('/Login/',UserController.signIn)
UserRouter.get('/search/',UserController.searchUser)
UserRouter.get('/auth/',auth,UserController.authenticate)
UserRouter.patch('/edit/account/',auth,UserController.editName)
// UserRouter.patch('/edit/password/',auth,UserController.editPassword)


module.exports=UserRouter