const express=require('express')
const router=express.Router()
const authController=require('../controller/auth.controller')


// auth routes 

router.post('/Register',authController.Register)
router.post('/Login',authController.Login)



module.exports=router