const express = require('express');
const router = express.Router();

const Payment = require("../models/payment");


// Admin - Delete the current Payment
router.post("/pay", async (req, res) => {
    console.log(`Deal: ${req.body.dealname} Batch: ${req.body.batch}, Amount: ${req.body.amount}`)
    
    const newPayment = new Payment({
        dealname: req.body.dealname,
        batch: req.body.batch,
        network: req.body.network,
        wallet: req.body.wallet,
        token: req.body.token,
        amount: req.body.amount,
    });

    try {
        res.send(await newPayment.save());
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

module.exports = router;