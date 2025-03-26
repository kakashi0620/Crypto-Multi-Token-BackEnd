const MongooseModel = require("../models/lectureModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

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
    //console.log("req.body=", req.body);
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

const getOneDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const doc = await MongooseModel.findById(id).populate("color");
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllDoc = asyncHandler(async (req, res) => {
  try {
    //const doc = await MongooseModel.find().populate("teacher");
    const doc = await MongooseModel.find().sort({date : -1}).populate("teacher");
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

function formatInt(num, totalDigits) {
  return String(num).padStart(totalDigits, '0');
}

const importDoc = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    let userMap = {};
    for (let i = 0; i < users.length; i++) {
      userMap["" + users[i].unit + "/" + users[i].name] = users[i]._id;
    }

    const lectures = await MongooseModel.find().populate("teacher");
    let lectureMap = {};
    for (let i = 0; i < lectures.length; i++) {
      const item = lectures[i]; 
      const isoString = item.date.toISOString();
      const date = isoString.split('T')[0].replaceAll('-', '/') + " " + isoString.split('T')[1].substring(0, 5);
      const key = "" + item.teacher?.unit + "/" + item.teacher?.name + date + item.title + item.group;  
      lectureMap[key] = true;
    }

    //console.log("lectureMap=", lectureMap);

    let imported = 0;
    let already_used = 0;
    
    let data = [];
    if (req.body) {
      for (let i = 0; i < req.body.length; i++) {
        let obj = {...req.body[i]};
        let key = "" + obj.teacher + obj.date + obj.title + obj.group;
        //console.log("key=", key);
        if (lectureMap[key]) {
          already_used++;
          continue;
        }

        obj.date = obj.date.split(' ')[0] + 'T' + obj.date.split(' ')[1] + ":00.000Z";
        //console.log("obj.date=", obj.date);
        obj.date = obj.date.replaceAll('/', '-');
        //console.log("replaced obj.date=", obj.date);
        obj.teacher = userMap[obj.teacher];

        delete obj.no;
        data.push(obj);
        imported++;
      }
    }

    //console.log("lecture import data=", data);
    console.log("already_used=", already_used, "imported=", imported);

    if (data.length > 0)
      await MongooseModel.create(data);
    
    res.json({
      already_used,
      imported
    });
  } catch (error) {
    console.log("Lecture import error=", error);
    throw new Error(error);
  }
});

module.exports = {
  createDoc,
  getOneDoc,
  getAllDoc,
  updateDoc,
  deleteDoc,
  deleteDocBatch,
  importDoc
};
