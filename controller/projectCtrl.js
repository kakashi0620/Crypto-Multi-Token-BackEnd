const MongooseModel = require("../models/projectModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createDoc = asyncHandler(async (req, res) => {
  try {
    console.log("createDoc req.body=", req.body);
    const newDoc = await MongooseModel.create(req.body);
    res.json(newDoc);
  } catch (error) {
    throw new Error(error);
  }
});

const updateDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const obj = await MongooseModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(obj);
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

    const projects = await MongooseModel.find().populate("member");
    let projectMap = {};
    for (let i = 0; i < projects.length; i++) {
      const item = projects[i]; 
      
      const isoString = item.start_date.toISOString();
      const start_date = isoString.split('T')[0];
      const key = "" + item.member?.unit + "/" + item.member?.name + item.name + start_date;  
      projectMap[key] = true;
    }

    //console.log("userMap=", userMap);

    let imported = 0;
    let already_used = 0;
    
    let data = [];
    if (req.body) {
      for (let i = 0; i < req.body.length; i++) {
        let obj = {...req.body[i]};
        let key = "" + obj.manager + obj.name + obj.start_date;
        if (projectMap[key]) {
          already_used++;
          continue;
        }
        //console.log("manager=", obj.manager);
        obj.member = userMap[obj.manager];
        delete obj.manager;
        delete obj.no;
        data.push(obj);
        imported++;
      }
    }

    //console.log("project import data=", data);
    console.log("already_used=", already_used, "imported=", imported);

    if (data.length > 0)
      await MongooseModel.create(data);
    
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
  createDoc,
  updateDoc,
  deleteDoc,
  getAllDoc,
  deleteDocBatch,
  importDoc,
};
