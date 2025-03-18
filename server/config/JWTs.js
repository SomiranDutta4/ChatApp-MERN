const jwt=require('jsonwebtoken')

module.exports=function(id){
    const token=jwt.sign({
        _id:id
        },process.env.ChatApp_Secret,{expiresIn:'1h'}
      )
      return token
}