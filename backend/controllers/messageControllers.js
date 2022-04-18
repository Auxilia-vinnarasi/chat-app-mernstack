const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
    //what  are all the things we need to send the message chatid,message,who is the sender of the msg
    //sender of the message-logged in user
    //other two will get it from body
    const { content, chatId } = req.body;
    
    if (!content || !chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = { //three things passing 
        sender: req.user._id,  //logged in user
        content: content,
        chat: chatId,
    };

    try {//we gonna create  query in our db
        var message = await Message.create(newMessage);
//im gonna populate sender with name and pic
        message = await message.populate("sender", "name pic").execPopulate();;
        message = await message.populate("chat").execPopulate();;
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage:message});
        res.json(message);
    }
    catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
    
});

const allMessages = asyncHandler(async (req, res) => {
    //fetching all of the messages for particular chat
    try {//we gonna query our db with that chat..
        const messages = await Message.find({ chat: req.params.chatId })//so we use req.params here cause in our messageRoutes has /:chatId -toaccess the params we use req.params
            .populate("sender", "name pic email")
            .populate("chat");
        //responce is send the messages..
        res.json(messages);
    } 

    catch (error) {
        res.status(400);
        throw new Error(error.message);
        
    }
})

module.exports = { sendMessage,allMessages };