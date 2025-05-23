const mongoose = require("mongoose");

const dealSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    banner: {
        type: String,
        required: true
    },
    round: {
        type: String,
        default: true
    },
    tokenprice: {
        type: String,
        required: false
    },
    fdv: {
        type: String,
        required: false
    },
    mc: {
        type: String,
        default: false
    },
    vesttge: {
        type: String,
        default: false
    },
    vestcliff: {
        type: String,
        default: false
    },
    vestgap: {
        type: String,
        default: false
    },
    fundrasing: {
        type: String,
        default: false
    },
    fee: {
        type: String,
        default: false
    },
    investmin: {
        type: String,
        default: true
    },
    investmax: {
        type: String,
        default: false
    },
    test: {
        type: String,
        default: false
    },
    weburl: {
        type: String,
        default: false
    },
    xurl: {
        type: String,
        default: false
    },
    discordurl: {
        type: String,
        default: false
    },
    teleurl: {
        type: String,
        default: false
    },
    tc_pulltrust: {
        type: Boolean,
        default: false
    },
    tc_pinmsg: {
        type: Boolean,
        default: false
    },
    tc_answer: {
        type: Boolean,
        default: false
    },
    tc_responsible: {
        type: Boolean,
        default: false
    },
    tc_acknowledge: {
        type: Boolean,
        default: false
    },
    tc_allocation: {
        type: Boolean,
        default: false
    },
    tc_never: {
        type: Boolean,
        default: false
    },
    livedate: {
        type: Date,
        default: false
    },
    createdate: {
        type: Date,
        default: false
    },
    timezone: {
        type: String,
        default: false
    },
    state: {
        type: String,
        default: true
    }
});


const dealModel = mongoose.model("deal", dealSchema);

module.exports = dealModel;