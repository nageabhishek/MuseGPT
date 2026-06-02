const express=require('express')
const router=express.Router()
// middleware
const authMiddleware=require('../middlewares/auth.middleware')
// controller
const chatController=require('../controller/chat.controller')

// Routes
router.post('/',authMiddleware,chatController)





module.exports=router