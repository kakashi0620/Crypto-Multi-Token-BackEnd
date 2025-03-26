const User = require("../models/userModel");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log("authMiddleWare decoded=", decoded);
        const user = await User.findById(decoded?.id);
        if (user === null)
          throw new Error("Not Authorized");
        //console.log("authMiddleWare user=", user);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized token, please login again");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  //console.log("isAdmin req.user", req.user);
  const { user_id } = req.user;
  const adminUser = await User.findOne({ user_id });

  if (adminUser.role !== "admin") {
    throw new Error("Your are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
