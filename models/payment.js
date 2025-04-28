const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    dealname: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: false
    },
    network: {
        type: String,
        required: false
    },
    wallet: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        default: false
    },
});


const paymentModel = mongoose.model("payment", paymentSchema);

module.exports = paymentModel;