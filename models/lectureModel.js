const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var lectureSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId, 
      required : true,
      ref: "User"
    },

    group : {
      type: Number,
      default: 0,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: ""
    },

    place: {
      type: String,
      required: true
    }
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Lecture", lectureSchema);
