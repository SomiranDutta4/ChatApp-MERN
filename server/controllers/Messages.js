const { default: mongoose } = require('mongoose')
const Message = require('../Models/Message')
const Chat = require('../Models/Chat')
const User = require('../Models/User')

module.exports.sendMessage = async function (req, res) {
    try {
        const { _id, chatId, content, reqId } = req.body;

        if (!_id || !chatId || (!content && !req.file)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newMessageId = new mongoose.Types.ObjectId();
        let users = [_id];
        if (reqId !== req.user._id) users.push(reqId);

        const chat = await Chat.findOne({ _id: chatId });

        const messageData = {
            _id: newMessageId,
            sender: _id,
            content: content || '',
            chat: chatId,
            isDeleted: false,
            readBy: [req.user._id],
        };

        if (req.file) {
            messageData.media = {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                path: req.file.path,
            };
        }

        const newMsg = await Message.create(messageData);
        newMsg.sender = req.user;

        if (chat) {
            if (chat.isGroupChat && !chat.users.includes(_id)) {
                return res.status(400).json({ message: 'You are not a member of this group' });
            }

            chat.latestMessage = newMessageId;
            await chat.save();

            return res.status(200).json({ message: 'sent message', chat, newMsg });
        } else {
            const newChat = await Chat.create({
                _id: chatId,
                chatName: 'randomXYZchatApp.123456789@#$%^&*()_+',
                isGroupChat: false,
                users: users,
                pastUsers: [],
                messages: [],
                latestMessage: newMessageId
            });

            newChat.latestMessage = newMsg;

            return res.status(200).json({ message: 'sent message', chat: newChat, newMsg });
        }
    } catch (err) {
        console.error("sendMessage error:", err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};


module.exports.seeMessage = function (req, res) {

    Message.updateMany({
        $and: [
            { chat: req.body.chatId },
            { readBy: { $ne: req.user._id } }
        ]
    },
        { $addToSet: { readBy: req.user._id } }
    ).then(result => {
        return res.status(200).json({ message: 'seen all the messages', number: result.nModified })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ message: 'error happened' })
    })
}

module.exports.deleteMessage = async function (req, res) {
    try {
        const message = await Message.findOne({ _id: req.body.messageId, chat: req.body.chatId })
        if (!message) {
            return res.status(400).json({ message: 'something went wrong' })
        }
        message.content = 'message was deleted'
        message.save()

        const chat = await Chat.findOne({ _id: req.body.chatId })
        if (!chat) {
            return res.status(400).json({ message: 'something went wrong' })
        }
        // if(chat.latestMessage==req.body.messageId){
        //     chat.latestMessage.content='message was deleted'
        // }
        chat.save()
        return res.status(200).json({ message: 'Message deleted' });

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting message', error: error.message });
    }

}

module.exports.editMessage = async function (req, res) {

    try {
        const message = await Message.findOne({ _id: req.body.messageId, chat: req.body.chatId })
        if (!message) {
            return res.status(400).json({ message: 'something went wrong' })
        }
        message.content = req.body.newContent
        message.save()

        const chat = await Chat.findOne({ _id: req.body.chatId })
        if (!chat) {
            return res.status(400).json({ message: 'something went wrong' })
        }
        // if(chat.latestMessage._id==req.body.messageId){
        //     chat.latestMessage.content=req.body.newContent
        // }
        chat.save()
        return res.status(200).json({ message: 'Message edited' });

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting message', error: error.message });
    }

}

const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: '4e2fee42f265418faa03520d92379556',
    baseURL: "https://api.aimlapi.com",
});

module.exports.sendAiMessage = async function (req, res) {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            messages: [
                { role: "system", content: "Your name is Bhidu, be playful and give short answers" },
                { role: "user", content: req.body.content }
            ],
            temperature: 0.7,
            max_tokens: 128,
        });
        return res.status(200).json({ message: 'message', content: chatCompletion.choices[0].message.content })
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: 'some error', content: "some error occured..." })
    }

};