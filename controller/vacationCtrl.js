const MongooseModel = require("../models/vacationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const User = require("../models/userModel");

const createDoc = asyncHandler(async (req, res) => {
  try {
    const doc = await MongooseModel.create(req.body);
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

const updateDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const doc = await MongooseModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const doc = await MongooseModel.findByIdAndDelete(id);

    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllDoc = asyncHandler(async (req, res) => {
  try {
    const doc = await MongooseModel.find().populate("member");
    res.json(doc);
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
          await MongooseModel.findByIdAndDelete(data[i]);
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
      userMap["" + users[i].unit + "/" + users[i].name] = users[i]._id;
    }

    const vacations = await MongooseModel.find().populate("member");
    let vacationMap = {};
    for (let i = 0; i < vacations.length; i++) {
      const item = vacations[i]; 

      const isoString = item.start_date.toISOString();
      const start_date = isoString.split('T')[0];
      const key = "" + item.member?.unit + "/" + item.member?.name + start_date;  
      vacationMap[key] = true;
    }

    //console.log("vacationMap=", vacationMap);

    let imported = 0;
    let already_used = 0;
    
    let data = [];
    if (req.body) {
      for (let i = 0; i < req.body.length; i++) {
        let obj = {...req.body[i]};
        let key = "" + obj.member + obj.start_date;

        if (vacationMap[key]) {
          already_used++;
          continue;
        }

        obj.member = userMap[obj.member];

        delete obj.no;
        delete obj.duration;
        data.push(obj);
        imported++;
      }
    }

    //console.log("vacation import data=", data);
    console.log("already_used=", already_used, "imported=", imported);

    if (data.length > 0)
      await MongooseModel.create(data);
    
    res.json({
      already_used,
      imported
    });
  } catch (error) {
    console.log("Equipment import error=", error);
    throw new Error(error);
  }
});

module.exports = {
  createDoc,
  updateDoc,
  deleteDoc,
  getAllDoc,
  deleteDocBatch,
  importDoc
};
