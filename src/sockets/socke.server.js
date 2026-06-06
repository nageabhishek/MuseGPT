const{ Server, Socket }=require("socket.io")
const aiService=require('../services/ai.service')
const userModel=require('../models/user.model')
const messageModel=require('../models/messages.model')
const{createMemory,queryMemory}=require('../services/vectordb.service')
const cookie=require('cookie')
const jwt=require('jsonwebtoken')
const { QueryVectorFromJSON } = require("@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data")


function initSocket(httpServer){
const io = new Server(httpServer, {});

// middleware 
io.use(async(Socket,next)=>{
  const cookies=cookie.parse(Socket.handshake.headers?.cookie ||"")
if(!cookies.token){
  next(new Error('Socket Authorization error'))
}
try{
  const decoded=jwt.verify(cookies.token,process.env.JWT_KEY)

  const user=await userModel.findById(decoded.id)
   Socket.user=user
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
    chat:data.chat
  }
})
// console.log(memory)

    // ltm memory
     await createMemory({
      vectors:vectors,
      messageaid:message.id,
      metadata:{
        chat:data.chat,
        user:socket.user._id,
        text:data.content

      }
    })


const chatHistory = (await messageModel.find({
    chat: data.chat
   }).sort({ createdAt: -1 }).limit(4).lean()).reverse();
    
    const response=await aiService.generateResponce(chatHistory.map(item=>{
      return {
        role:item.role,
        parts:[{text:item.content}]
      }
    }))
    
// stm memory q
    const responseMessage= await messageModel.create({
      chat:data.chat,
      content:response,
      role:"model"
    })
    //ltm
    const responceVectors=await aiService.generateVector(response)
     await createMemory({
      vectors:responceVectors,
      messageaid:responseMessage.id,
      metadata:{
        chat:data.chat,
        user:socket.user._id,
        text:response

      }
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