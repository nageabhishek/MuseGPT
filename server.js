require('dotenv').config()
const dns = require('dns');
// Bypass Fiber ISP DNS, use Google/Cloudflare
dns.setServers(['8.8.8.8', '1.1.1.1']); 
const app=require('./src/app')
// database
const connectDb=require('./src/db/db')
// const =require()
// socket server
const httpServer=require('http').createServer(app)
const initSocket=require('./src/sockets/socke.server')

connectDb()
initSocket(httpServer)
httpServer.listen(3000,()=>{
    console.log('conneted to server')
})
