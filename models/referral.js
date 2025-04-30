const mongoose = require("mongoose");

const referralSchema = mongoose.Schema({
    dealname: {
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
    wallet: {
        type: String,
        required: false
    },
    from: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    to: {
        type: String,
        required: false
    },
    toname: {
        type: String,
        required: false
    },
    level: {
        type: String,
        default: false
    },
    amount: {
        type: Number,
        default: false
    },
    state: {
        type: String,
        default: 'Waiting'
    }
});


const referralModel = mongoose.model("referral", referralSchema);

module.exports = referralModel;