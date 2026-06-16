const express=require('express')
const app=express()

/* Routes */
const authRoutes=require('./Routes/auth.route')
const chatRoutes=require('../src/Routes/chat.route')
const cookieParser=require('cookie-parser')
const authMiddleware=require('./middlewares/auth.middleware')
const path = require("path");
app.set("view engine","ejs");

app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(express.json())
app.use(cookieParser())



// using routes
app.use('/api/auth',authRoutes)
app.use('/api/chat',chatRoutes)

/// ejs
app.get("/", (req,res)=>{
    res.render("home");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});


app.get(
    "/chat",

    authMiddleware.authUser,

    (req,res)=>{

        res.render("chat",{
            user:req.user
        })

    }
)



module.exports=app