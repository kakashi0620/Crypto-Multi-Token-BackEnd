const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model

// How to add empty string value for objectId in mongoose?
// Solution ChatGPT provided is as following

// const yourSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         validate: {
//             validator: function(v) {
//                 // Allow empty strings and valid ObjectIds
//                 return v === '' || mongoose.Types.ObjectId.isValid(v);
//             },
//             message: props => `${props.value} is not a valid ObjectId!`
//         }
//     },
//     // other fields...
// });


var equipmentSchema = new mongoose.Schema(
  {
    user : {
      type: mongoose.Schema.Types.ObjectId, 
      required: false,
      set: value => (value === '' ? undefined : value),
      ref: "User"
    },

    owner : {
      type: mongoose.Schema.Types.ObjectId, 
      required: false,
      set: value => (value === '' ? undefined : value),
      ref: "User"
    },

    callpc : {
      type: String
    },

    type : {
      type: String,
      required: true,
    },

    brand : {
      type: String,
    },

    spec : {
      type: String,
    },

    serial : {
      type: String,
    },

    unit : {
      type: String,
      default : "124"
    },

    isAbnormal : {
      type: Boolean,
      default: false
    },

    abnormalDate : {
      type : Date
    },

    note : {
      type : String
    }
  },
  { timestamps: true, minimize: true}
);

//Export the model
module.exports = mongoose.model("Equipment", equipmentSchema);
