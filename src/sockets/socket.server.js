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
   const [message,vectors]=await Promise.all([
     messageModel.create({
      chat:data.chat,
      content:data.content,
      role:"user"
    }),
      aiService.generateVector(data.content)


   ])


    await createMemory({
      vectors,
      messageId:message._id,
      metadata:{
        chat:data.chat,
        // user:socket.user._id,
        text:data.content
      }


    })
 
    const[memory,chatHistory]=await Promise.all([
          queryMemory({
  queryVector:vectors,
  limit:3,
  metadata:{
    user:socket.user._id
  }
}),
 messageModel.find({
    chat: data.chat
   }).sort({ createdAt: 1 }).limit(20).lean()

    ])
    

 

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

    socket.emit('answer',{
      content:response,
      chat:data.chat

    })

    const[responseMessage,responceVector]=await Promise.all([
       messageModel.create({
      chat:data.chat,
      content:response,
      role:"model"
    }),
     aiService.generateVector(response)


    ])

    
     await createMemory({
      vectors,
      messageId:message._id,
      metadata:{
        chat:data.chat,
        user:socket.user._id,
        text:data.content
      }


    })

  
  })

  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});



}

module.exports=initSocket