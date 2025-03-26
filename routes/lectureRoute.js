const express = require('express');
const router = express.Router();

const Lecture = require("../models/lecture");

// Get All Lectures
router.get("/getAllLectures", async (req, res) => {
    try {
        const lectures = await Lecture.find({});
        res.send(lectures);

    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


// Get Lecture By ID
router.post("/getLectureById", async (req, res) => {
    const lectureId = req.body.lectureId;

    try {
        const lecture = await Lecture.findOne({ _id: lectureId })
        res.send(lecture);

    } catch (error) {
        return res.status(400).json({ message: error });
    }
});



// Admin - Add New Lecture
router.post("/addLecture", async (req, res) => {
    try {
        const newLecture = new Lecture(req.body);
        await newLecture.save();
        res.send("New Lecture added successfully");
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});


// Admin - Delete the current Lecture
router.delete("/deleteLecture/:id", async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({ message: "No lecture found" })
        }

        await Lecture.findByIdAndDelete(req.params.id);
        res.send("Lecture deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


module.exports = router;