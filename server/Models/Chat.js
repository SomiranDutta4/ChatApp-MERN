const mongoose = require("mongoose");

const chatModel = new mongoose.Schema(
  {
    pic: {
      type: String,
      required: true,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    chatName: { type: String, trim: true },
    unseenMsg: { type: Boolean, required: true, default: false },
    isGroupChat: { type: Boolean, required: true, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: { type: Object, default: [], required: true },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    deletedFor: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;
