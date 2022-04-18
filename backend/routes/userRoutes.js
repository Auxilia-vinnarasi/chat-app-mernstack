const express = require("express");
const { registerUser } = require("../controllers/userControllers");
const { authUser, allUsers } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
//im gonna write all my routes which is related our users are  here 
//create an instance of our router from express
const router = express.Router(); //will use this router to create differenct different routes

//router.route("/login").get(()=>{}).post(()=>{})

//router.route("/").post(registerUser).get(protect,allUsers);//creating the api for search user endpoint
router.post("/", registerUser);
router.get("/", protect);
router.get("/",allUsers); 
router.post("/login", authUser);



{/*}
router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
*/}
module.exports = router;

