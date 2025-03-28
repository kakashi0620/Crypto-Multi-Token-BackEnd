const mongoose = require("mongoose");

const referralSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    totalAmount: {
        type: String,
        required: false
    },
    stackAmount: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: false
    },
});


const referralModel = mongoose.model("referral", referralSchema);

module.exports = referralModel;