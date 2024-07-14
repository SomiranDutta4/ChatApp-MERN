const express=require('express')
const chatRouter=express.Router()
const ChatController=require('../controllers/Chat')
const Auth=require('../middleware/Auth')

chatRouter.get('/get/all/',Auth,ChatController.fetchAllChats)
chatRouter.get('/get/one/',Auth,ChatController.ClickedChat)
chatRouter.post('/get/new/',Auth,ChatController.createNew)
chatRouter.post('/new/group/',Auth,ChatController.createGroup)
chatRouter.patch('/add/admin/',Auth,ChatController.addAdmin)
chatRouter.patch('/remove/member/',Auth,ChatController.removeMember)
chatRouter.patch('/remove/admin/',Auth,ChatController.removeAdmin)

module.exports=chatRouter