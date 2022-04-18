const mongoose = require("mongoose"); //connect our MongoDB DB we use mongoose
const colors = require("colors");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
           useFindAndModify: false,
           useCreateIndex:true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
    }
    catch (error) {
        console.log(`Error:${error.message}`);
        process.exit();
    }
};

module.exports = connectDB;
   
        
   
