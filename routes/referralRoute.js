const express = require('express');
const router = express.Router();

const Referral = require("../models/referral");

// Admin - Get All Referrals
router.get("/getAllReferrals", async (req, res) => {
    try {
        const currentReferrals = await Referral.find();
        res.send(currentReferrals);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current Referral
router.delete("/deleteReferral/:id", async (req, res) => {
    try {
        const court = await Referral.findById(req.params.id);

        if (!court) {
            return res.status(404).json({ message: "No court found" })
        }

        await Referral.findByIdAndDelete(req.params.id);
        res.send("Referral deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;