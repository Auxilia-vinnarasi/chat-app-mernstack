const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");


const registerUser = asyncHandler(async (req,res) => {

    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the fields")
    }
    const userExists = await User.findOne({ email });
    
    if (userExists) {
        res.status(400);
        throw new Error("User already Exists")
    }

    const user = await User.create({
        name, email, password, pic
    })
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(400);
        throw new Error("Failed to create the user")
        
    }
}
);

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
             isAdmin: user.isAdmin,
            pic: user.pic,
            token:generateToken(user._id),
        })
    }
    else {
        res.status(401)
        throw new Error("Invalid Email or Password");
        }
})

// /api/user ? search=piyush -if we want to take query from our api we wrote req.query.and name of that query is search
const allUsers = asyncHandler(async (req, res) => {
                                            //if there is any query inside of it we gonna search the user with that email and name using $or-we have to fullfilleither of thi char
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};
    //console.log(keyword);
    
    //Now query the DB
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users);  

})//to authorize if the user is logged in or not go to authmiddleware
module.exports = { registerUser,authUser,allUsers };