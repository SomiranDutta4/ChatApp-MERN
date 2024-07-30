const tokenGenerate=require('../config/JWTs')
const User=require('../Models/User')
const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
const { validationResult } = require('express-validator');

module.exports.signUp=function(req,res){
    let errors=validationResult(req);
    if (!errors.isEmpty()) {return res.status(440).json({message:'validation failed'})}

    User.findOne({contactNumber:req.body.number}).then(user=>{
        if(user){
            return res.status(401).json({message:'user already exists'})
        }
    })
    const isAdmin=false
    if(req.body.isAdmin && req.body.isAdmin==true){
        isAdmin=true
    }
    try {
        
    } catch (error) {
        
    }
    bcrypt.hash(req.body.password,12).then(hashedPassword=>{
        User.create({
            name:req.body.name,
            contactNumber:req.body.email,
            password:hashedPassword,
            isAdmin:isAdmin
        }).then(done=>{
            return res.status(200).json({message:'Successfully created an account'})
        }).catch(err=>{
            console.log(err)
            return res.status(500).json({message:'Some Server side error, we regret for any indiscrepency'})
        })
    }).catch(err=>{
        return res.status(500).json({message:err.message})
    })
}

module.exports.signIn=function(req,res){
    let errors=validationResult(req);
    if (!errors.isEmpty()) {return res.status(440).json({message:'validation failed'})}

    let password=req.query.password
    User.findOne({
        contactNumber:req.query.email
    })
    .then(foundUser=>{
        if(!foundUser){
            return res.status(400).json({message:'No registered user found with this email: Please Signup first'})
        }
        const token=tokenGenerate(foundUser._id)
        bcrypt.compare(password,foundUser.password).then(result=>{
            if(!result){
                return res.status(401).json({message:'The entered password was wrong, try again'})
            }
            let user={
                name:foundUser.name,
                contactNumber:foundUser.contactNumber,
                // email:foundUser.email,
                pic:foundUser.pic,
                isAdmin:foundUser.isAdmin
            }
            return res.status(200).json({
                _id:foundUser._id,
                token:token,
                user
            })
        }).catch(err=>{
            console.log(err)
            return res.status(500).json({message:err.message})
    })
    }).catch(err=>{
        return res.status(500).json({message:'error!'})
    })
}

module.exports.searchUser=function(req,res){
    console.log(req.query)

    User.find({name:req.query.user}).then(user=>{
        if(!user|| user.length==0){return res.status(400).json({message:'no such user found'})}

        let sentUsers=[]
        user.forEach(ele=>{
            let userArray=[req.user]
            if(String(req.user._id)!=String(ele._id)){
                userArray.push(ele)
            }
            sentUsers.push({
                name:ele.name,
                _id:ele._id,
                pic:ele.pic,
                isGroupChat:false,
                groupAdmins:[],
                createdBy:'',
                contactNumber:ele.contactNumber,
                users:userArray
            })            
        })
        return res.status(201).json({message:'found these',users:sentUsers})
    }).catch(err=>{
        console.log(err)
        return res.status(500).json({message:'error in searching, we regret our inconveninience',err})
    })
}
module.exports.searchForGroup=function(req,res){
    User.find().then(users=>{
        let foundUsers=users.filter(user=>user.name.toLowerCase().startsWith(req.query.input.toLowerCase()))
        return res.status(200).json({message:'found users',users:foundUsers})
    })
}

module.exports.editName=function(req,res){
    User.findOne({contactNumber:req.use.contactNumber}).then(user=>{
        user.name=req.body.name
        user.save()
        return res.status(200).json({message:'changed Successfully'})
    }).catch(err=>{
        return res.status(500).json({message:'error changing name, please try later'})
    })
}

module.exports.editPassword=function(req,res){
    User.findOne({contactNumber:req.user.contactNumber,password:req.body.oldPassword}).then(user=>{
        if(user){
            user.password=req.body.newPasword
            user.save()
            return res.status(200).json({message:'successfully updated'})
        }else{
            return res.status(400).json({message:'could not update'})
        }
    }).catch(err=>{
        return res.status(500).json({message:'error occured'})
    })
}
module.exports.editAcc=function(req,res){
    User.findById(req.user._id).then(user=>{
        if(user){
            if(user.password!=req.body.oldPassword){
                return res.status(400).json({message:'wrong old pass'})
            }else{
                user.name=req.body.newName
                user.contactNumber=req.body.newNumber
                user.password=req.body.newPass
                user.pic=req.body.newPic
                user.save()
    
                let newPic=user.pic
                if(req.body.newPic){newPic=req.body.newPic}
                let user={
                    name:req.body.newName,
                    contactNumber:req.body.newNumber,
                    email:user.email,
                    pic:newPic,
                    isAdmin:user.isAdmin
                }
                return res.status({
                    message:'updated',
                    _id:user._id,
                    user:user
                })
            }
        }else{
            return res.status(400).json({message:'could not update'})
        }
    }).catch(err=>{
        return res.status(500).json({message:'some error occured, we regtret our shortcomings'})
    })
}

module.exports.authenticate=function(req,res){
    return res.status(200).json({message:'authenticated'})
}
