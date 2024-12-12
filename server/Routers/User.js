const express=require('express')
const UserRouter=express.Router()
const UserController=require('../controllers/User')
const auth=require('../middleware/Auth')
const User = require('../Models/User')
const { body,query } = require('express-validator');



UserRouter.post('/Signup',
    body('email').isEmail(),
    body('password').isLength({min:6}),
    body('name').notEmpty(),
    UserController.signUp)

UserRouter.get('/Login/',
    query('email').isEmail(),
    UserController.signIn)

UserRouter.get('/search/',auth,UserController.searchUser)
UserRouter.get('/auth/',auth,UserController.authenticate)
UserRouter.patch('/edit/account/',auth,UserController.editAcc)
UserRouter.get('/search/',UserController.searchForGroup)
UserRouter.patch('/send/mail/',UserController.sendEmail)

module.exports=UserRouter