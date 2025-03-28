const express = require('express');
const router = express.Router();

const ReferralWithdrawHistory = require("../models/referralWithdrawHistory");

// Admin - Get All ReferralWithdrawHistorys
router.get("/getAllReferralWithdrawHistorys", async (req, res) => {
    try {
        const currentReferralWithdrawHistorys = await ReferralWithdrawHistory.find();
        res.send(currentReferralWithdrawHistorys);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current ReferralWithdrawHistory
router.delete("/deleteReferralWithdrawHistory/:id", async (req, res) => {
    try {
        const court = await ReferralWithdrawHistory.findById(req.params.id);

        if (!court) {
            return res.status(404).json({ message: "No court found" })
        }

        await ReferralWithdrawHistory.findByIdAndDelete(req.params.id);
        res.send("ReferralWithdrawHistory deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



module.exports = router;