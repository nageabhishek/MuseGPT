const express=require('express')
const app=express()

/* Routes */
const authRoutes=require('./Routes/auth.route')
const chatRoutes=require('../src/Routes/chat.route')
const cookieParser=require('cookie-parser')


// Middleware
app.use(express.json())
app.use(cookieParser())



// using routes
app.use('/api/auth',authRoutes)
app.use('/api/chat',chatRoutes)


module.exports=app