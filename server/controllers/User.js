const tokenGenerate = require('../config/JWTs')
const User = require('../Models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Chat = require('../Models/Chat')
const Message = require('../Models/Message')
const Review = require('../Models/Review')
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

function generateOTP(length = 6) {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric OTP
}


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
            pic: req.body.pic,
            isAdmin: isAdmin
        })
        let newId = new mongoose.Types.ObjectId
        await Message.create({
            content: 'Chat with yourself',
            _id: newId,
        })
        const chat = await Chat.create({
            chatName: 'YOU',
            isGroupChat: false,
            users: [Newuser],
            latestMessage: newId,
            unseenMsg: 1,
            messages: [],
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
    if (!password) {
        password = req.body.password
    }
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

module.exports.searchUser = async function (req, res) {
    const searchQuery = req.query.user?.trim();

    if (!searchQuery) {
        return res.status(400).json({ message: 'Search query required' });
    }

    try {
        // Using regex for partial match and case-insensitive search
        const users = await User.find({
            name: { $regex: searchQuery, $options: 'i' }  // i = case-insensitive
        });

        if (!users.length) {
            return res.status(404).json({ message: 'No users found' });
        }

        const sentUsers = users
            .filter(u => String(u._id) !== String(req.user._id))
            .map(ele => ({
                name: ele.name,
                _id: ele._id,
                pic: ele.pic,
                isGroupChat: false,
                groupAdmins: [],
                createdBy: '',
                contactNumber: ele.contactNumber,
                users: [req.user, ele]
            }));

        return res.status(200).json({ message: 'Users found', users: sentUsers });
    } catch (err) {
        console.error("Error in user search:", err);
        return res.status(500).json({ message: 'Internal server error', err });
    }
}

module.exports.searchForGroup = function (req, res) {
    User.find().then(users => {
        let foundUsers = users.filter(user => user.name.toLowerCase().startsWith(req.query.input.toLowerCase()))
        return res.status(200).json({ message: 'found users', users: foundUsers })
    })
}

// module.exports.editName=function(req,res){
//     User.findOne({contactNumber:req.use.contactNumber}).then(user=>{
// user.name=req.body.name
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
    console.log(req.body)
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const { otp, newName, newNumber, oldPassword, newPass, newPic } = req.body;

        if (!newPass && newNumber == user.contactNumber) {
            user.name = req.body.newName
            await user.save();
            return res.status(200).json({ message: 'updated profile', user: user });
        }
        //check for password correct
        if (oldPassword) {
            const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Old password is incorrect' });
            }
        }
        if (!otp) {
            const generatedOTP = generateOTP();
            user.otp = generatedOTP;
            user.otpExpiry = Date.now() + 10 * 60 * 1000;
            await user.save();

            try {
                await transporter.sendMail({
                    from: {
                        name: 'SocioNode',
                        address: 'noReply@SocioNode.user',
                    },
                    to: user.contactNumber,
                    subject: 'OTP for Password Change',
                    html: `<div>
            <h2>OTP to update your account:</h2>
            <h1>${generatedOTP}</h1>
            <p>This OTP is valid for 10 minutes.</p>
            <br>
            <p>If this wasn't you, ignore this email.</p>
            <span>Regards, SocioNode Team</span>
          </div>`,
                });
            } catch (err) {
                console.log("OTP email error:", err);
                return res.status(500).json({ message: 'Could not send OTP email' });
            }

            return res.status(202).json({
                message: 'OTP sent to your email. Please verify to proceed.',
            });
        }
        if (
            user.otp !== otp ||
            !user.otpExpiry ||
            new Date(user.otpExpiry) < new Date()
        ) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }
        if (newName) user.name = newName;
        if (newNumber) user.contactNumber = newNumber;
        if (newPass) {
            const hashed = await bcrypt.hash(newPass, 12);
            user.password = hashed;
        }
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();
        console.log('success');
        return res.status(200).json({
            message: 'User updated successfully',
            _id: user._id,
            user: user,
        });
    } catch (err) {
        console.error('editAcc error:', err);
        return res.status(500).json({
            message: 'Some error occurred, we regret our shortcomings',
        });
    }
};

module.exports.updatePic = async function (req, res) {
    let user = await User.findById(req.user._id);
    if (user) {
        user.pic = req.query.url;
        await user.save();
        return res.status(200).json({ success: true });
    } else {
        return res.status(400).json({ message: 'some error occures' })
    }
}
module.exports.authenticate = function (req, res) {
    return res.status(200).json({ message: 'authenticated' })
}

module.exports.feedback = async (req, res) => {
    const { rating, feedback, type } = req.body;

    if (!rating || !feedback) {
        return res.status(400).json({ message: 'Rating and feedback are required.' });
    }

    try {
        const review = new Review({ rating, feedback, type });
        await review.save();

        res.status(200).json({ message: 'Feedback saved successfully.' });
    } catch (err) {
        console.error('Error saving review:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};
