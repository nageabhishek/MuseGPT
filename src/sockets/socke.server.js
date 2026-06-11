const{ Server }=require("socket.io")
const aiService=require('../services/ai.service')
const userModel=require('../models/user.model')
const messageModel=require('../models/messages.model')
const{createMemory,queryMemory}=require('../services/vectordb.service')
const cookie=require('cookie')
const jwt=require('jsonwebtoken')


function initSocket(httpServer){
const io = new Server(httpServer, {});

// middleware 
io.use(async(socket,next)=>{
  const cookies=cookie.parse(socket.handshake.headers?.cookie ||"")
if(!cookies.token){
  next(new Error('Socket Authorization error'))
}
try{
  const decoded=jwt.verify(cookies.token,process.env.JWT_KEY)

  const user=await userModel.findById(decoded.id)
   socket.user=user
next()


}
catch(err){
  next(new Error(" socket error invalid token"))
}

})


io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on('question',async(data)=>{

      // stm memory question data
   const message= await messageModel.create({
      chat:data.chat,
      content:data.content,
      role:"user"
    })

    const vectors=await aiService.generateVector(data.content)
    const memory=await queryMemory({
  queryVector:vectors,
  limit:3,
  metadata:{
    user:socket.user._id
  }
})

    await createMemory({
      vectors,
      messageId:message._id,
      metadata:{
        chat:data.chat,
        // user:socket.user._id,
        text:data.content
      }


    })
 
    

 


const chatHistory = (await messageModel.find({
    chat: data.chat
   }).sort({ createdAt: -1 }).limit(20).lean()).reverse();
    

const stm=chatHistory.map(item=>{
  return{
    role:item.role,
    parts:[{text:item.content}]
  }
})

const ltm = [ {
               role: "user",
                    parts: [ {
                        text: `

                        these are some previous messages from the chat, use them to generate a response

                        ${memory.map(item => item.metadata.text).join("\n")}
 ` } ]} ]



    const response=await aiService.generateResponce([...ltm,...stm])

    const responceVector=await aiService.generateVector(response)
     await createMemory({
      vectors,
      messageId:message._id,
      metadata:{
        chat:data.chat,
        user:socket.user._id,
        text:data.content
      }


    })

    



    
// stm memory q
    const responseMessage= await messageModel.create({
      chat:data.chat,
      content:response,
      role:"model"
    })
   

    socket.emit('answer',{
      response,
      chat:data.chat

    })

  })

  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});



}

module.exports=initSocket