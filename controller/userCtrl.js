const User = require("../models/userModel");
const Lecture = require("../models/lectureModel");
const uniqid = require("uniqid");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createPasswordResetToken } = require("../models/userModel");
const bcrypt = require("bcrypt");
// Create a User ----------------------------------------------

const createUser = asyncHandler(async (req, res) => {
  /**
   * TODO:Get the email from req.body
   */
  const user_id = req.body.user_id;
  /**
   * TODO:With the help of email find the user exists or not
   */
  const findUser = await User.findOne({ user_id: user_id });

  if (!findUser) {
    /**
     * TODO:if user not found user create a new user
     */
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    /**
     * TODO:if user found then thow an error: User already exists
     */
    throw new Error("User already exists");
  }
});

// Login a user
const loginUser = asyncHandler(async (req, res) => {
  const { user_id, password } = req.body;
  // check if user exists or not
  const foundUser = await User.findOne({ user_id });
  //console.log("loginUser found=", foundUser);
  
  if (foundUser === null) {
    throw new Error("Unregistered User!");
  }
  
  if (foundUser && (await foundUser.isPasswordMatched(password))) {
    // const refreshToken = await generateRefreshToken(foundUser?._id);
    // const user = await User.findByIdAndUpdate(
    //   foundUser._id,
    //   {
    //     refreshToken: refreshToken,
    //   },
    //   { new: true }
    // );

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 72 * 60 * 60 * 1000,
    // });

    res.json({
      _id : foundUser._id.toString(),
      user_id : foundUser.user_id, 
      name : foundUser.name, 
      role : foundUser.role, 
      birthday : foundUser.birthday, 
      unit : foundUser.unit, 
      team : foundUser.team,
      netkey_user : foundUser.netkey_user, 
      netkey_machine : foundUser.netkey_machine, 
      group : foundUser.group, 
      start_date : foundUser.start_date, 
      end_date : foundUser.end_date,
      token: generateToken(foundUser?._id),
    });
  } else {
    throw new Error("Password incorrect");
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const updateUser = asyncHandler(async (req, res) => {
  let _id = req.user._id;
  if (req && req.body && req.body._id)
    _id = req.body._id;

  console.log("updateUser _id=", _id);
  validateMongoDbId(_id);

  const curUser = await User.findById(_id);
  
  if (curUser === null) {
    throw new Error("Unregistered User!");
  }

  let updateObj = {
    name: req?.body?.name,
    user_id : req?.body?.user_id ? req?.body?.user_id : curUser.user_id,
    birthday: req?.body?.birthday,
    unit: req?.body?.unit,
    team: req?.body?.team,
    role : req?.body?.role,
    netkey_user: req?.body?.netkey_user,
    netkey_machine: req?.body?.netkey_machine,
    group: req?.body?.group,
    start_date: req?.body?.start_date,
    end_date: req?.body?.end_date,
  };
  //console.log("updateObj=", updateObj);

  const foundUser = await User.findById(_id);
  
  if (foundUser === null) {
    throw new Error("Unregistered User!");
  }

  if (req && req.body) {
    if (req.body.curPassword && req.body.newPassword) {
      console.log("Updating password from profile");

      const passwordMatched = await foundUser.isPasswordMatched(req.body.curPassword);
      if (!passwordMatched) {
        throw new Error("Incorrect password");
      }
  
      if (req.body.newPassword !== req.body.confirmPassword) {
        throw new Error("New password mismatch");
      }
  
      const salt = await bcrypt.genSaltSync(10);
      updateObj.password = await bcrypt.hash(req.body.newPassword, salt);
    } else if (req.user && req.user.role === 'admin') {
      if (req.body.password) {
        console.log("Updating password from Users (admin)");
        if (req.body.password !== req.body.confirm_password)
          throw new Error("Password mismatch");
        const salt = await bcrypt.genSaltSync(10);
        updateObj.password = await bcrypt.hash(req.body.password, salt);
      }
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        ...updateObj
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    console.log("updateUser error=", error);
    throw new Error("UserID already exists!");
  }
});

const getUserMetaList = asyncHandler(async (req, res) => {
  try {
    let query = User.find().select("_id name unit").sort({unit:1, name:1}).collation({ locale: 'en', strength: 2 });
    const doc = await query;
    //console.log("getUserMetaList doc=", doc);
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({}, {password : 0}).sort({role : 1});
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const curUser = await User.findById(id);
    if (curUser === null) {
      throw new Error("Unregistered user");
    }
    if (curUser.role === 'admin') {
      throw new Error("Admin couldn't be deleted");
    }

    const deletedUser = await User.findByIdAndDelete(id);
    res.json({
      deletedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

// Get all users

const getNotification = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    let users = await User.aggregate([
    {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$birthday" }, month] },
              { $eq: [{ $dayOfMonth: "$birthday" }, day] }
            ]
          }
        }
      }
    ]).sort({group : 1});

    users = users.map(value => {
      return {
        name : value.name,
        unit : value.unit,
        group : value.group,
        user_id : value.user_id
      }
    });

    const lectures = await Lecture.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $year: "$date" }, year] },
              { $eq: [{ $month: "$date" }, month] },
              { $eq: [{ $dayOfMonth: "$date" }, day] }
            ]
          }
        }
      },
      {
        $lookup: {
            from: "users", // The collection to join
            localField: "teacher", // Field from the input documents
            foreignField: "_id", // Field from the documents of the "from" collection
            as: "teacher" // Output array field
        }
      },
      
      {
          $unwind: "$teacher" // Deconstructs the array field from $lookup
      },
      
    ]);


    res.json({users, lectures});
  } catch (error) {
    throw new Error(error);
  }
});

const deleteDocBatch = asyncHandler(async (req, res) => {
  try {
    if (req.body) {
      //console.log("deleteDocBatch", req.body);
      try {
        const data = req.body;
        for (let i = 0; i < data.length; i++) {
          const curUser = await User.findById(data[i]);
          if (curUser.role !== 'admin') {
            await User.findByIdAndDelete(data[i]);
          }
        }
        res.json({batchDelete:true});
      } catch (error) {
        throw new Error(error);
      }
    }
  } catch (error) {
    console.log("deleteDocBatch in batch mode error=", error);
    throw new Error(error);
  }
});

const importDoc = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    let userMap = {};
    for (let i = 0; i < users.length; i++) {
      userMap[users[i].user_id] = true;
    }

    let imported = 0;
    let already_used = 0;
    
    let data = [];
    if (req.body) {
      for (let i = 0; i < req.body.length; i++) {
        let obj = {...req.body[i]};

        if (userMap[obj.user_id]) {
          already_used++;
          continue;
        }

        delete obj.no;
        obj.unit = obj.union;
        obj.password = "123456";
        delete obj.union;
        data.push(obj);
        imported++;
      }
    }

    //console.log("equipment import data=", data);
    console.log("already_used=", already_used, "imported=", imported);
    if (data.length > 0) {
      await User.create(data);
    }
    res.json({
      already_used,
      imported
    });
  } catch (error) {
    console.log("equipment import error=", error);
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  handleRefreshToken,
  logout,
  updateUser,
  getallUsers,
  getaUser,
  deleteUser,
  updatePassword,
  getUserMetaList,
  getNotification,
  deleteDocBatch,
  importDoc
};
