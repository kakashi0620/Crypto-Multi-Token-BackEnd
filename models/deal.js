const mongoose = require("mongoose");

const dealSchema = mongoose.Schema({
    dealName: {
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
    tokenPrice: {
        type: String,
        required: false
    },
    fullyDilutedValuation: {
        type: String,
        required: false
    },
    initialMarketCap: {
        type: String,
        default: false
    },
    vestingSummary: {
        type: String,
        default: false
    },
    fundraisingTarget: {
        type: String,
        default: false
    },
    fees: {
        type: String,
        default: false
    },
    minInvestLimit: {
        type: String,
        default: true
    },
    maxInvestLimit: {
        type: String,
        default: false
    },
    test: {
        type: String,
        default: false
    },
    webURL: {
        type: String,
        default: false
    },
    twitterURL: {
        type: String,
        default: false
    },    
    discordURL: {
        type: String,
        default: false
    },    
    telegramURL: {
        type: String,
        default: false
    }
});


const dealModel = mongoose.model("deal", dealSchema);

module.exports = dealModel;