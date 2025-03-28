const mongoose = require("mongoose");

const referralWithdrawHistorySchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: false
    },
    chain: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: false
    },
    detail: {
        type: String,
        required: false
    },
});


const referralWithdrawHistoryModel = mongoose.model("referralWithdrawHistory", referralWithdrawHistorySchema);

module.exports = referralWithdrawHistoryModel;