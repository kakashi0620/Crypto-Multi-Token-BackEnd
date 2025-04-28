const express = require('express');
const router = express.Router();

const Payment = require("../models/payment");
const Distribution = require("../models/distribution");


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

router.get("/canpay/:dealname", async (req, res) => {
    const { dealname } = req.params;
    console.log(`Can pay query received => dealname: ${dealname}`)

    const curBatch = await getCurBatch(dealname)
    
    console.log(`curBatch: ${curBatch}`)
    if (curBatch === "") {
        res.json({
            can: false
        })
    } else {
        const now = new Date();

        // Find distributions for the dealname, before or equal to now
        const payments = await Payment.find({
            dealname: dealname
        })
        console.log(`payments: ${payments}`)
    
        if (payments.length > 0) {
            const latest = payments[payments.length - 1];
            console.log(`latest: ${latest}`)
            res.json({
                can: (latest.batch !== curBatch)
            })
        }
        else {
            res.json({
                can: true
            })
        }
    }
});

const getCurBatch = async (dealname) => {
    const now = new Date();

    // Find distributions for the dealname, before or equal to now
    const distributions = await Distribution.find({
        dealname: dealname,
        date: { $lte: now },
    }).sort({ date: -1 }); // Sort by date descending

    if (distributions.length > 0) {
        const latest = distributions[0];
        return latest.type
    }
    
    return ""
}

module.exports = router;