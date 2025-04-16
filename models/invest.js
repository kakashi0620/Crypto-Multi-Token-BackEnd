const mongoose = require("mongoose");

const investSchema = mongoose.Schema({
    investor: {
        type: String,
        required: true
    },
    dealname: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    }
});


const investModel = mongoose.model("invest", investSchema);

module.exports = investModel;