const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var vacationSchema = new mongoose.Schema(
  {
    member : {
      type: mongoose.Schema.Types.ObjectId, 
      required : true,
      ref: "User"
    },

    destination : {
      type : String,
      required : true
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
module.exports = mongoose.model("Vacation", vacationSchema);
