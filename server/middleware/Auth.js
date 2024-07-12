const jwt=require('jsonwebtoken')
const User=require('../Models/User')

module.exports=async function(req,res,next){
    let token;
    try {
        token = req.query.token
    } catch (error) {
        token=null
    }
    if(!token){
        return res.status(401).json({message:'no token present'})
    }

    jwt.verify(token,'ChatApp-Secret',async function(err,decoded){
        if(err){
            return res.status(401).json({error:err,message:'Login again'})
        }
        const user=await User.findOne({_id:decoded._id})
        try {
            req.user=user
        } catch (error) {
            console.log(error)
        }
        next()
    })
}