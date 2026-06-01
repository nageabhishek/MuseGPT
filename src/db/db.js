const mongoose=require('mongoose')

 async function connectDb(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log('connected to Database')
    }

    catch(err){
        console.log(err)
    }

}

module.exports=connectDb