const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        default: true
    },
    permanentAddress: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    mobileNumber: {
        type: String,
        default: false
    },
    telegramId: {
        type: String,
        default: false
    },
    twitterId: {
        type: String,
        default: false
    },
    discordId: {
        type: String,
        default: false
    },
    loginWallet: {
        type: String,
        default: true
    },
    btcWallet: {
        type: String,
        default: false
    },
    solanaWallet: {
        type: String,
        default: false
    },
    anotherWallet1: {
        type: String,
        default: false
    },
    anotherWallet2: {
        type: String,
        default: false
    }
});


const userModel = mongoose.model("user", userSchema);

module.exports = userModel;