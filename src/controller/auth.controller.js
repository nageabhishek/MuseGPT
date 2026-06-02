const userModel=require('../models/user.model')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')


// register controller
async function Register(req,res){
    const {fullname:{firstname,lastname},email,password}=req.body
    // check user exist or not
    const isUserExist=await userModel.findOne({email})
    if(isUserExist){
        return res.status(400).json({
            message:"user already exist"
        })
    }

    // create user 
    const user=await userModel.create({
        fullname:{
            firstname,lastname
        },
        email,
        password:await bcrypt.hash(password,10)// hash password
        
    })

    //create token and save in cookie
    const token=jwt.sign({id:user._id},process.env.JWT_KEY)
    res.cookie('token',token)

    res.json({
        message:"user register Sucessfully",
        user:user

    })



}
// login controller
async function Login(req,res){
    const {email,password}=req.body

    // validate email
    const isUser=await userModel.findOne({email})

    if(!isUser){
        return res.json({
            message:"Invalid Email or Password"
        })
    }

    // validate password
    const isValidPass= await bcrypt.compare(password,isUser.password)
    if(!isValidPass){
        return res.json({
            message:"Invalid Password try again"
        })
    }

    const token=jwt.sign({id:isUser._id},process.env.JWT_KEY)
    res.cookie('token',token)

    res.json({
        message:'user loggedIn succesfully',
        user:{
           id: isUser._id,
           email:isUser.email,
           password:isUser.password

        }
        
    })


}




module.exports={
    Register,
    Login
}