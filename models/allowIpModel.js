const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var allowIpSchema = new mongoose.Schema(
  {
    from : {
      type : String,
      required : true
    },

    to : {
      type : String,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("AllowIp", allowIpSchema);
