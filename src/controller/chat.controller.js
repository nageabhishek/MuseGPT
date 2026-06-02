const chatModel=require('../models/chat.model')

async function createChat(req,res){
    const {title}=req.body
    const user=req.user

    const chat=await chatModel.create({
        title,
        user:user._id
        // user:user_id

    })

    res.json({
        message:"chat created succesfully",
        chat:chat
    })
}

module.exports=createChat
