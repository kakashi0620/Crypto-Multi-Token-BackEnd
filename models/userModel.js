const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    user_id : {
      type: String,
      required: true,
      unique: true,
    },

    name : {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    password: {
      type: String,
      required: true,
    },

    birthday: {
      type: Date,
    },

    unit: {
      type: String,
      required: true,
    },

    team: {
      type: String
    },

    netkey_user: {
      type: String,
      required: true,
    },

    netkey_machine: {
      type: String,
      required: true,
    },

    group: {
      type: Number,
      default : 0
    },

    start_date : {
      type: Date
    },

    end_date : {
      type: Date
    },

    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  console.log("userSchema pre save");
  if (!this.isModified("password")) {
    next();
  }
  console.log("userSchema pre save password updated");
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
