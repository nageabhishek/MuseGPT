const userModel=require("../models/user.model")
const jwt=require('jsonwebtoken')

async function authUser(req,res,next){
    const token=req.cookies?.token
// validate tokn
   if(!token){
        // return res.json({
        //     message:"unauthorize:no token found"
        // })
         return res.redirect("/login")
    }
    try{

    
        const decoded=jwt.verify(token,process.env.JWT_KEY)
        const user=await userModel.findOne({_id:decoded.id})

        req.user=user
        next()


    }
    catch(err){
        // res.json({
        //     message:"Unauthorized: invalid token"
        // })
         return res.redirect("/login")
    }


}


module.exports={authUser}