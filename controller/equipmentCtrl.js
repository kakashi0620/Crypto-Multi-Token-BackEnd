const MongooseModel = require("../models/equipmentModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");

const createDoc = asyncHandler(async (req, res) => {
  if (req.body.serial) {
    const checkDoc = await MongooseModel.findOne({ serial: req.body.serial });
    if (checkDoc) {
      let findUser = await User.findById(checkDoc.user);
      console.log("findUser=", findUser);
      if (!findUser) {
        throw new Error(`Unused equipment with Serial ${req.body.serial} already exists`);
      } else {
        throw new Error(`${findUser.unit}/${findUser.name} is already using this equipment with Serial ${req.body.serial}`);
      }
    }
  }

  try {
    const doc = await MongooseModel.create(req.body);
    res.json(doc);
  } catch (error) {
    console.log("createEquipment error=", error);
    throw new Error(error);
  }
});

const createDocBatch = asyncHandler(async (req, res) => {
  try {
    const doc = await MongooseModel.create(req.body);
    res.json(doc);
  } catch (error) {
    console.log("createDocBatch in batch mode error=", error);
    throw new Error(error);
  }
});

const importDoc = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    let userMap = {};
    let admin = "";
    let adminId = "";

    for (let i = 0; i < users.length; i++) {
      userMap["" + users[i].unit + "/" + users[i].name] = users[i]._id;
      
      if (users[i].role === 'admin') {
        admin = "" + users[i].unit + "/" + users[i].name;
        adminId = users[i]._id;
      }
    }
    //console.log("req.body=", req.body);
    //console.log("userMap=", userMap);

    let serialMap = {};
    const equipment = await MongooseModel.find();
    for (let i = 0; i < equipment.length; i++) {
      serialMap[equipment[i].serial] = true;
    }

    let imported = 0;
    let already_used = 0;
    
    let data = [];
    if (req.body) {
      for (let i = 0; i < req.body.length; i++) {
        let obj = {...req.body[i]};

        if (obj.serial && serialMap[obj.serial]) {
          already_used++;
          continue;
        }

        obj.user = userMap[obj.user];
        
        if (obj.owner === admin)
          obj.owner = adminId;
        else
          obj.owner = userMap[obj.owner];

        delete obj.callpc;
        delete obj.group;
        delete obj.netkey;
        delete obj.no;
        data.push(obj);
        imported++;
      }
    }

    //console.log("import data=", data);
    console.log("already_used=", already_used, "imported=", imported);
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

const updateDoc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  if (req.body.serial) {
    const checkDoc = await MongooseModel.findOne({ serial: req.body.serial});
    if (checkDoc && checkDoc._id.toString() !== id) {
      //console.log("checkDoc=", checkDoc, "id=", id);
      let findUser = await User.findById(checkDoc.user);
      if (!findUser) {
        throw new Error(`Unused equipment with Serial ${req.body.serial} already exists`);
      } else {
        throw new Error(`${findUser.unit}/${findUser.name} is already using this equipment with Serial ${req.body.serial}`);
      }
    }
  }

  try {
    console.log("updateEquipment value=", req.body);
    const data = {...req.body};
    //if (!req.body.user)
    //  data.user = null;
    //if (!req.body.owner)
    //  data.owner = null;
    const doc = await MongooseModel.findByIdAndUpdate(id, data, {
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
    const doc = await MongooseModel.findById(id);
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

/*const getAllDoc = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = MongooseModel.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const count = await MongooseModel.countDocuments();
      if (skip >= count) throw new Error("This Page does not exists");
    }
    const doc = await query.populate("user").populate("owner");
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});*/

const getAllDoc = asyncHandler(async (req, res) => {
  try {
    let query = MongooseModel.aggregate(
      [
        {
          $lookup: {
              from: "users", // The collection to join
              localField: "user", // Field from the input documents
              foreignField: "_id", // Field from the documents of the "from" collection
              as: "user" // Output array field
          }
        },
        {
          $lookup: {
              from: "users", // The collection to join
              localField: "owner", // Field from the input documents
              foreignField: "_id", // Field from the documents of the "from" collection
              as: "owner" // Output array field
          }
        },
        {
          $unwind: 
					{
						path : "$user", // Deconstructs the array field from $lookup
						preserveNullAndEmptyArrays: true 
					}
        },
        {
            $unwind: {
              path : "$owner", // Deconstructs the array field from $lookup
              preserveNullAndEmptyArrays: true 
            }
        },
        {
          $sort : {
            "user.unit" : 1,
            "user.name" : 1,
          }
        }
      ]
    ).collation({ locale: 'en', strength: 2 });
    const doc = await query;
    res.json(doc);
  } catch (error) {
    throw new Error(error);
  }
});

const getSummary = asyncHandler(async (req, res) => {
  try {
    const collection = await MongooseModel.find();
    
    let typeIdxMap = {};
    let arr = [];
    for (let i = 0; i < collection.length; i++) {
      const type = collection[i].type ? collection[i].type.toLocaleUpperCase() : "";
      const idx = typeIdxMap[type];
      if (idx === undefined) {
        typeIdxMap[type] = arr.length;
        let val;
        if (collection[i].user) {
          val = {key:arr.length, type, used_normal: 0, used_abnormal : 0, unused_normal : 0, unused_abnormal : 0};
          if (collection[i].isAbnormal)
            val.used_abnormal = 1;
          else
            val.used_normal = 1;
        } else {
          val = {key:arr.length, type, used_normal: 0, used_abnormal : 0, unused_normal : 0, unused_abnormal : 0};
          if (collection[i].isAbnormal)
            val.unused_abnormal = 1;
          else
            val.unused_normal = 1;
        }

        arr.push(val);
      } else {
        if (collection[i].user) {
          if (collection[i].isAbnormal)
            arr[idx].used_abnormal++;
          else
            arr[idx].used_normal++;
        }
        else {
          if (collection[i].isAbnormal)
            arr[idx].unused_abnormal++;
          else
            arr[idx].unused_normal++;
        }
      }
    }
    let obj = {
      key:arr.length, 
      type : "TOTAL", 
      used_normal: 0, 
      used_abnormal : 0, 
      unused_normal : 0, 
      unused_abnormal : 0,
      row_cls : "summary-total-row"
    };
    for (let i = 0; i < arr.length; i++) {
      obj.used_normal += arr[i].used_normal;
      obj.used_abnormal += arr[i].used_abnormal;
      obj.unused_normal += arr[i].unused_normal;
      obj.unused_abnormal += arr[i].unused_abnormal;
    }
    arr.push(obj);
    //console.log("arr=", arr);
    res.json(arr);
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  createDoc,
  getOneDoc,
  getAllDoc,
  updateDoc,
  deleteDoc,
  getSummary,
  createDocBatch,
  deleteDocBatch,
  importDoc
};
