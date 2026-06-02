require('dotenv').config()
const app=require('./src/app')
// database
const connectDb=require('./src/db/db')

connectDb()
app.listen(3000,()=>{
    console.log('conneted to server')
})