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
router.get("/getbydeal/:dealname", async (req, res) => {
    try {
        res.send(await Distribution.find({ dealname: dealname }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;