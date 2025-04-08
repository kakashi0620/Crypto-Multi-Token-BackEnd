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
    vest: {
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
    }
});


const dealModel = mongoose.model("deal", dealSchema);

module.exports = dealModel;