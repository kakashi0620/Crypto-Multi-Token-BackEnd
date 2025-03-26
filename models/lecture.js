const mongoose = require("mongoose");

const lectureSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    group: {
        type: Number,
        default: true
    },
    title: {
        type: String,
        default: true
    },
    description: {
        type: String,
        default: true
    },
    place: {
        type: String,
        default: true
    }
});


const lectureModel = mongoose.model("lecture", lectureSchema);

module.exports = lectureModel;