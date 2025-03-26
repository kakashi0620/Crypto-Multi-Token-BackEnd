const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    netKeyUser: {
        type: String,
        default: true
    },
    netKeyMachine: {
        type: String,
        default: true
    },
    callPC: {
        type: String,
        default: true
    },
    type: {
        type: String,
        default: true
    },
    brand: {
        type: String,
        default: true
    },
    spec: {
        type: String,
        default: true
    },
    serial: {
        type: String,
        default: true
    },
    user: {
        type: String,
        default: true
    },
    owner: {
        type: String,
        default: true
    },
    rb: {
        type: String,
        default: true
    }
});


const deviceModel = mongoose.model("device", deviceSchema);

module.exports = deviceModel;