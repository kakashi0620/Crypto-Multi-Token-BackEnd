const MongooseModel = require("../models/allowIpModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const ip = require('ip');

let allowIpList = [];


async function updateAllowIp()
{
  const doc = await MongooseModel.find();
  allowIpList = [];

  if (doc != null) {
    for (let i = 0; i < doc.length; i++) {
      allowIpList.push(
        {
          from : ip.toLong(doc[i].from), 
          to : ip.toLong(doc[i].to)
        }
      );
    }
  }

  global.allowIpList = allowIpList;

  console.log("allowIpList=", allowIpList);
}

updateAllowIp();

const createDoc = asyncHandler(async (req, res) => {
  try {
    const doc = await MongooseModel.create(req.body);
    await updateAllowIp();
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
    await updateAllowIp();
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
    await updateAllowIp();
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllDoc = asyncHandler(async (req, res) => {
  try {
    const doc = await MongooseModel.find();
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
        await updateAllowIp();
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
    const already_used = 0;
    const imported = req.body ? req.body.length : 0;
    await MongooseModel.create(req.body);
    await updateAllowIp();
    res.json({
      already_used,
      imported
    });
  } catch (error) {
    console.log("AllowIP import error=", error);
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
