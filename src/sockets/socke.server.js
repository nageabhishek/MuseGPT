const{ Server, Socket }=require("socket.io")
const generateResponce=require('../services/ai.service')
const userModel=require('../models/user.model')
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
    

    const response=await generateResponce(data.content)
    // console.log(response)
    socket.emit('answer',{response})

  })

  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});



}

module.exports=initSocket