const express = require('express');
const router = express.Router();

const Deal = require("../models/deal");

// Admin - Get All Deals
router.get("/getAllDeals", async (req, res) => {
    try {
        const currentDeals = await Deal.find();
        res.send(currentDeals);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current Deal
router.delete("/deleteDeal/:id", async (req, res) => {
    try {
        const court = await Deal.findById(req.params.id);

        if (!court) {
            return res.status(404).json({ message: "No court found" })
        }

        await Deal.findByIdAndDelete(req.params.id);
        res.send("Deal deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



module.exports = router;