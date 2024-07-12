const express=require('express')
const chatRouter=express.Router()
const ChatController=require('../controllers/Chat')
const auth=require('../middleware/Auth')

chatRouter.get('/get/all/',auth,ChatController.fetchAllChats)
chatRouter.get('/get/one/',auth,ChatController.ClickedChat)
chatRouter.post('/get/new/',auth,ChatController.createNew)
chatRouter.post('/new/group/',auth,ChatController.createGroup)

module.exports=chatRouter