const{ Server }=require("socket.io")

function initSocket(httpServer){
    
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
  console.log("a user connected");
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});



}

module.exports=initSocket