const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

//protect middleware wrap this up wthi asynchandler since its a middleware i use req,res,next

const protect = asyncHandler(async (req, res, next) => {

    let token;

    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //bearer is a token if the two is satisfied we can have the token
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];//decode the token -the token looks like this -Bearer ffdkjsdfsdcn
//so that i have to remove the bearer from the token for that above code is using
      //decodes token id then we have to verify it
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");//find userin db we return it witout password

      next()   //move on to next otherwise throw error
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };

    
    
