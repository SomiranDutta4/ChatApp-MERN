const tokenGenerate = require('../config/JWTs')
const User = require('../Models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Chat = require('../Models/Chat')
const Message=require('../Models/Message')
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.smtpGmail,
        pass: process.env.smtpGmail_Pass,
    }
})
module.exports.signUp = async function (req, res) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(440).json({ message: 'validation failed' }) }

    let user = await User.findOne({ contactNumber: req.body.email })
    if (user) {
        return res.status(401).json({ message: 'user already exists' })
    }

    const isAdmin = false
    if (req.body.isAdmin && req.body.isAdmin == true) {
        isAdmin = true
    }
    try {
        let newpassword = await bcrypt.hash(req.body.password, 12)
        // then(hashedPassword => {
        let Newuser = await User.create({
            name: req.body.name,
            contactNumber: req.body.email,
            password: newpassword,
            pic:req.body.pic,
            isAdmin: isAdmin
        })
        // .then(done => {
        //     return res.status(200).json({ message: 'Successfully created an account' })
        // }).catch(err => {
        //     return res.status(500).json({ message: 'Some Server side error, we regret for any indiscrepency' })
        // })
        // })
        let newId=new mongoose.Types.ObjectId
        await Message.create({
            content:'Chat with yourself',
            _id:newId,
        })
        const chat = await Chat.create({
            chatName: Newuser.name,
            isGroupChat: false,
            users: [Newuser],
            latestMessage:newId,
            unseenMsg: 1,
            messages:[],
            createdAt: new Date()
        })
        // console.log(chat);

        return res.status(200).json({ message: 'created successfully' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'some error occured' })
    }

}
module.exports.sendEmail = async function (req, res) {
    if (req.query.status == 200) {
        try {
            await transporter.sendMail({
                from: {
                    name: 'SocioNode',
                    address: 'noReply@SocioNode.user'
                },
                to: req.query.email,
                subject: 'Successfully Signed Up! ',
                text: `You successfully Signed Up to ChatNgine with your email id:${req.query.email}`,
                html: `<div>
                    <h2>You successfully Signed Up to ChatNgine with your email id:</h2>
                    <h1>${req.query.email}</h1>
                    <p>If this was not you please contact with:</p>
                    <br>
                    <a href='mailto:d.somiran@iitg.ac.in'>contact email</a>
                    <br>
                    <p>Have a Great Day</p>
                    <span>regards, Somiran Dutta</span>
                    </div>`
            }).then(done => {
            }).catch(err => {
                return
            })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports.signIn = function (req, res) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(440).json({ message: 'validation failed' }) }

    let password = req.query.password
    if(!password){
        password=req.body.password
    }
    console.log(req.query,password)
    User.findOne({
        contactNumber: req.query.email
    })
        .then(foundUser => {
            if (!foundUser) {
                return res.status(400).json({ message: 'No registered user found with this email: Please Signup first' })
            }
            const token = tokenGenerate(foundUser._id)
            bcrypt.compare(password, foundUser.password).then(result => {
                console.log(result)
                if (!result) {
                    return res.status(401).json({ message: 'The entered password was wrong, try again' })
                }
                let user = {
                    name: foundUser.name,
                    contactNumber: foundUser.contactNumber,
                    // email:foundUser.email,
                    pic: foundUser.pic,
                    isAdmin: foundUser.isAdmin
                }
                return res.status(200).json({
                    _id: foundUser._id,
                    token: token,
                    user
                })
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ message: err.message })
            })
        }).catch(err => {
            return res.status(500).json({ message: 'error!' })
        })
}

module.exports.searchUser = function (req, res) {

    User.find({ name: req.query.user }).then(user => {
        if (!user || user.length == 0) { return res.status(400).json({ message: 'no such user found' }) }

        let sentUsers = []
        user.forEach(ele => {
            let userArray = [req.user]
            if (String(req.user._id) != String(ele._id)) {
                userArray.push(ele)
            }
            sentUsers.push({
                name: ele.name,
                _id: ele._id,
                pic: ele.pic,
                isGroupChat: false,
                groupAdmins: [],
                createdBy: '',
                contactNumber: ele.contactNumber,
                users: userArray
            })
        })
        return res.status(201).json({ message: 'found these', users: sentUsers })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ message: 'error in searching, we regret our inconveninience', err })
    })
}
module.exports.searchForGroup = function (req, res) {
    User.find().then(users => {
        let foundUsers = users.filter(user => user.name.toLowerCase().startsWith(req.query.input.toLowerCase()))
        return res.status(200).json({ message: 'found users', users: foundUsers })
    })
}

// module.exports.editName=function(req,res){
//     User.findOne({contactNumber:req.use.contactNumber}).then(user=>{
//         user.name=req.body.name
//         user.save()
//         return res.status(200).json({message:'changed Successfully'})
//     }).catch(err=>{
//         return res.status(500).json({message:'error changing name, please try later'})
//     })
// }

// module.exports.editPassword=function(req,res){
//     User.findOne({contactNumber:req.user.contactNumber,password:req.body.oldPassword}).then(user=>{
//         if(user){
//             user.password=req.body.newPasword
//             user.save()
//             return res.status(200).json({message:'successfully updated'})
//         }else{
//             return res.status(400).json({message:'could not update'})
//         }
//     }).catch(err=>{
//         return res.status(500).json({message:'error occured'})
//     })
// }
module.exports.editAcc = async function (req, res) {
    try {
        let user = await User.findById(req.user._id)
        if (user) {
            let result = await bcrypt.compare(user.password, req.body.oldPassword)
            if (req.body.newPass && !result) {
                return res.status(400).json({ message: 'wrong old pass' })
            } else {
                user.name = req.body.newName
                user.contactNumber = req.body.newNumber
                // user.password=req.body.newPass
                user.pic = req.body.newPic
                user.save()
                if (req.body.newPass) {
                    let newPass = await bcrypt.hash(req.body.newPass, 12)
                    user.password = newPass
                    user.save()
                }
                // let newPic=user.pic
                // if(req.body.newPic){newPic=req.body.newPic}
                // let user={
                //     name:req.body.newName,
                //     contactNumber:req.body.newNumber,
                //     email:user.email,
                //     pic:newPic,
                //     isAdmin:user.isAdmin
                // }
                return res.status(200).json({
                    message: 'updated',
                    _id: user._id,
                    user: user
                })
            }
        } else {
            return res.status(400).json({ message: 'could not update' })
        }
    } catch (err) {
        return res.status(500).json({ message: 'some error occured, we regtret our shortcomings' })
    }
}
module.exports.updatePic=async function(req,res){
    let user=await User.findById(req.user._id);
    if(user){
        user.pic=req.query.url;
        await user.save();
        return res.status(200).json({success:true});
    }else{
        return res.status(400).json({message:'some error occures'})
    }
}
module.exports.authenticate = function (req, res) {
    return res.status(200).json({ message: 'authenticated' })
}
