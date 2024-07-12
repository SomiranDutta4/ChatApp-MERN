const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: "String", required: true },
    contactNumber: { type: Number, unique: true, required: true },
    email:{type:String},
    password: { type: "String", required: true },
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
);
const User = mongoose.model("User", userSchema);

module.exports = User;