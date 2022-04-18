const asyncHandler = require("express-async-handler");

const Chat = require("../models/chatModel");
const User = require("../models/userModel");


const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;//if the chat with user id exists return it 

    if (!userId) {//if doesnt exists u
        console.log("userId param not sent with request");
        return res.sendStatus(400);
    }
    //if the chat exists with this user 
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [//both req have to be true// it should match particular id
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } } //so both should match for chat to exist
        ],
    }).populate("users", "-password").populate("latestMessage");//except password return me anything
    //sender field we want 
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });
    if (isChat.length > 0) {//if the chat exists gonna send the chat otherwise create new chat with this two
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],//logged in user and user id with which we trying to create the chat
        };
        //query it and store it in our db
        try {
            const createdChat = await Chat.create(chatData); //the chat is created
            //send it to user
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(FullChat);
        }
        catch (error) {
            res.status(400);
            throw new Error(error.message);
            
        }
    }
    
});

const fetchChats = asyncHandler(async (req, res) => {
    try {//we are going to search all the chat array 
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
                res.status(200).send(results);
            })
    }
    catch (error) {
        res.status(400)
        throw new Error(error.message);
        
    }
    
});

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the Fields" });
    }
    //we are gonna send an array so we have to send it in stringify format

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a Group chat");
    }

    users.push(req.user);//current user logged in ..
    //after users array has been created im gonna add query to that db so try catch

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user, //im the one who is creating the group chat 
        });
        //im gonna fetch group chat from db send it back to our user.. so that query is
        //create the chat fetch the chat from db and send back to user
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }

});

const renameGroup = asyncHandler(async (req, res) => {
    //so we gonna rename for that im gonna tack chat id and for that give new name

    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,//so im gonna update from that oldchat name to new chatname
        {
           chatName:chatName, //chatName:chatName since its same im gonna take one
        },
        {
             new:true,//if i dont write this its give my old chat name
        }

    )//imgonna populate users and groupadmin
        .populate("users", "-password")
    .populate("groupAdmin","-password")

    if (!updatedChat) {
        res.status(404)
        throw new Error("Chat Not Found")
    }
    else {
        res.json(updatedChat)
    }
    

    
})
  
const addToGroup = asyncHandler(async (req, res) => {
    // chat id which we are supposed to add the user to  and the particular user that we gonna add to that particular chat 
    const { chatId,userId} = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId, {
        $push: { users: userId },
    }, {
        new: true
    },
    ) //after the user has been succesfully added
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
    if (!added) { // if not added 
        res.status(404)
        throw new Error("chat Not Found")
    }
    else { //otherwiese send the data
        res.json(added);
    }
});

const removeFromGroup = asyncHandler(async (req, res) => {
    
    const { chatId, userId } = req.body;

    const removed =await Chat.findByIdAndUpdate(
        chatId, {
        $pull: { users: userId },
    }, {
        new: true
    },
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404)
        throw new Error("chat not Found")
    }
    else {
        res.json(removed);
    }
    
})  

module.exports = { accessChat, fetchChats, createGroupChat,renameGroup,addToGroup,removeFromGroup,};