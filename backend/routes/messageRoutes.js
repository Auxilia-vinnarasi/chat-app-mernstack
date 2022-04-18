const express = require("express"); //import express
const { protect } = require("../middleware/authMiddleware");
const { sendMessage } = require("../controllers/messageControllers");
const { allMessages } = require("../controllers/messageControllers");
//create router
const router = express.Router();
//create 2 routes here
//first route sending the message, 2nd route - to fetch all of the message in a particular chat


router.post("/", protect);
//i want the loggedin user to access this route so ive used protect middleware
router.post("/", sendMessage);

//1.Creating end point for fetching all of the messages in particular chat...
router.get("/:chatId", protect); //fetching all of the messages for particular chat
router.get("/:chatId", allMessages);

module.exports = router;  