const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var projectSchema = new mongoose.Schema(
  {
    member : {
      type: mongoose.Schema.Types.ObjectId, 
      required : true,
      ref: "User"
    },

    name : {
      type : String,
      required : true
    },

    price : {
      type : String,
      required : true
    },

    stack : {
      type : String,
    },

    description : {
      type : String,
    },

    project_url : {
      type : String,
    },

    job_site : {
      type : String
    },

    start_date : {
        type: Date
    },

    end_date : {
        type: Date
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Project", projectSchema);
