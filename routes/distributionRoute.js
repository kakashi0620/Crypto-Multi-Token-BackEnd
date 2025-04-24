const express = require('express');
const router = express.Router();

const Distribution = require("../models/distribution");

// Admin - Get All Distributions
router.get("/getAllDistributions", async (req, res) => {
    try {
        const currentDistributions = await Distribution.find();
        res.send(currentDistributions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current Distribution
router.post("/add", async (req, res) => {

    console.log(`${req.body.dealname} Add a new schedule.\nType: ${req.body.type}, Date: ${req.body.date}, Percent: ${req.body.percent}`)

    const newDistribution = new Distribution({
        dealname: req.body.dealname,
        type: req.body.type,
        date: req.body.date,
        percent: req.body.percent
    });

    try {
        res.send(await newDistribution.save());
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.get("/getbydeal/:dealname", async (req, res) => {
    const { dealname } = req.params;
    try {
        res.send(await Distribution.find({ dealname: dealname }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;