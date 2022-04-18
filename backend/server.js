const express = require("express"); //import express
const { chats }  = require("./data/data");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
//const { Socket } = require("socket.io");

dotenv.config();
connectDB();     //from db.js we are importing
//im gonna create instance of this express variable
const app = express();

app.use(express.json());//to accept json Data//in userController we use FE name,email,password,pic and all so we use express framework here




//im gonna make get request to "/"route so that /route will give call back,that call back give send req,res
app.get('/', (req, res) => {
   // console.log(res);
    res.send("API is running successfully");
});
    

{/*
app.get('/api/chat', (req, res) => {
    //console.log(req);
    res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
   // console.log(req.params.id);  in req we have params in params we have id so req.params.id
    const singleChat = chats.find((c) => c._id === req.params.id);
    res.send(singleChat);
  
})
*/}

//im gonna use here another endpoint 
app.use("/api/user", userRoutes);

//imgonna create APi for chat creation
app.use("/api/chat", chatRoutes);

//im gonna create api for messages
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
 
//for app variable we have to create server
const server = app.listen(PORT, console.log(`server started running on PORT ${PORT}`.yellow.bold));

const io = require("socket.io")(server, {

    pingTimeout:60000, // after the 60msec close the connection to save the bandwidth..
    cors:
    {
         origin:"http://localhost:3000",
     }
}
);

io.on("connection", (socket) => {
    console.log("connected to socket.io");
    //im gonna create socket.on function for setup
    socket.on("setup", (userData) => {
        socket.join(userData._id);   //so this has created a particular room for the user;
       // console.log(userData._id);
        socket.emit("connected");
    });
    //this will take room id from the frontend
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    }); //if we click any of the chat its gonna create new room for chat

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    //this socket is called send msg
    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if (!chat.users) return console.log("chat.users not defined");//if the chat doesnt have any users
        //5 person are there in chat the chat so it should be received only to the other 4 so not to me

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return; //if this is sent by us return it;
            //you are not supposed to send me back this msg...
            //otherwise when it compares to other  user then send it to them..
            socket.in(user._id).emit("message received", newMessageReceived);
       
        });
    });
     //to cleanup the data after weve done with it..cause its consume many bandwidth..
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
}); 


