const{ Server, Socket }=require("socket.io")
const aiService=require('../services/ai.service')
const userModel=require('../models/user.model')
const messageModel=require('../models/messages.model')
const{createMemory,queryMemory}=require('../services/vectordb.service')
const cookie=require('cookie')
const jwt=require('jsonwebtoken')


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
 

 


const chatHistory = (await messageModel.find({
    chat: data.chat
   }).sort({ createdAt: -1 }).limit(20).lean()).reverse();
    
    const response=await aiService.generateResponce(chatHistory.map(item=>{
      return {
        role:item.role,
        parts:[{text:item.content}]
      }
    }))
    
// stm memory q
     await messageModel.create({
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