const express = require('express');
const router = express.Router();

const Deal = require("../models/deal");
const Payment = require("../models/payment");
const Distribution = require("../models/distribution");


// Admin - Delete the current Payment
router.post("/pay", async (req, res) => {
    const dealname = req.body.dealname;
    console.log(`Deal: ${dealname} Batch: ${req.body.batch}, Amount: ${req.body.amount}`)

    const newPayment = new Payment({
        dealname: dealname,
        batch: req.body.batch,
        network: req.body.network,
        wallet: req.body.wallet,
        token: req.body.token,
        amount: req.body.amount,
    });

    try {
        res.send(await newPayment.save());
        updateDealStateToComplete(dealname)
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.get("/canpay/:dealname", async (req, res) => {
    const { dealname } = req.params;
    console.log(`Can pay query received => dealname: ${dealname}`)

    const curBatch = await getCurBatch(dealname)
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

        if (payments.length > 0) {
            const latest = payments[payments.length - 1];
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

router.get("/total/:dealname", async (req, res) => {
    console.log(`Get total payment amount received`, req.params)
    const { dealname } = req.params;  // Get dealname from query params

    if (!dealname) {
        return res.status(400).json({ error: 'dealname is required' });
    }

    try {
        const summary = await Payment.aggregate([
            { $match: { dealname } },  // Match the dealname from query
            {
                $group: {
                    _id: "$dealname", // group by dealname
                    totalAmount: { $sum: "$amount" } // sum amounts
                }
            },
            {
                $project: {
                    _id: 0,             // hide _id
                    dealname: "$_id",   // rename _id to dealname
                    totalAmount: 1
                }
            }
        ]);

        if (summary.length > 0)
            res.json({totalAmount: summary[0].totalAmount});
        else
            res.json({totalAmount: 0});
    } catch (error) {
        console.error('Error aggregating payments', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Helper functions.
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

const updateDealStateToComplete = async (dealname) => {
    const schedulesBefore = await Distribution.find({
        dealname,
        date: { $lte: new Date() }
    });

    const totalReceived = schedulesBefore.reduce((sum, item) => sum + item.percent, 0);
    if (totalReceived === 100) {
        const deal = await Deal.findOne({ name: dealname })

        const newState = 'Completed'
        if (deal.state !== newState) {
            await Deal.updateOne({ _id: deal._id }, { $set: { state: newState } });
            console.log('Deal state updated to Completed.')
        }
    }
}

module.exports = router;