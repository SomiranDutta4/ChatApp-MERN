const express=require('express')
const UserRouter=express.Router()
const UserController=require('../controllers/User')
const auth=require('../middleware/Auth')
const User = require('../Models/User')

UserRouter.post('/Signup',UserController.signUp)
UserRouter.get('/Login/',UserController.signIn)
UserRouter.get('/search/',auth,UserController.searchUser)
UserRouter.get('/auth/',auth,UserController.authenticate)
UserRouter.patch('/edit/account/',auth,UserController.editName)
UserRouter.get('/search/',UserController.searchForGroup)

module.exports=UserRouter