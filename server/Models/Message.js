const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chat:{type:mongoose.Schema.Types.ObjectId,ref:'Chat'},
    isDeleted:{type:Boolean}
  },
  { timestamps: true }
);

const Message=mongoose.model('Message',messageSchema)
module.exports=Message