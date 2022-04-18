const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup} = require("../controllers/chatControllers");
const router = express.Router();

//only logged in user can access the route so that we are using protect middleware
router.post("/", protect);
router.post("/",accessChat);//chat creation
router.get("/", protect); 
router.get("/",fetchChats);
//im going to get all the chats for the partiicular user from db so that fetchchats
//creation of our group
//these are all the chat endpoints
router.post("/group", protect);
router.post("/group", createGroupChat)

router.put("/rename", protect);
router.put("/rename", renameGroup);

router.put("/groupadd", protect)
router.put("/groupadd", addToGroup);

router.put("/groupremove", protect);
router.put("/groupremove",removeFromGroup);
//these are all the endpoints im gonna working on in postman and chatcontrollers

module.exports = router;





