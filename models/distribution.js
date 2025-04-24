const mongoose = require("mongoose");

const distributionSchema = mongoose.Schema({
    dealname: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    percent: {
        type: Number,
        default: false
    },
});


const distributionModel = mongoose.model("distribution", distributionSchema);

module.exports = distributionModel;