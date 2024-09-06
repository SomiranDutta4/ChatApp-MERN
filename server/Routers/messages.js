const express=require('express')
const MessageRouter=express.Router()
const MessageController=require('../controllers/Messages')
const Auth=require('../middleware/Auth')

MessageRouter.patch('/send/',Auth,MessageController.sendMessage)
MessageRouter.delete('/delete/',Auth,MessageController.deleteMessage)
MessageRouter.patch('/edit/',Auth,MessageController.editMessage)
MessageRouter.patch('/see/',Auth,MessageController.seeMessage)
MessageRouter.post('/send/sendAiMessage/',Auth,MessageController.sendAiMessage)
MessageRouter.patch('/ai/bot/',Auth,MessageController.sendAiMessage);

module.exports=MessageRouter