const express = require('express');
const router = express.Router();

const Invest = require("../models/invest");


router.post("/invest", async (req, res) => {

    console.log(`${req.body.investor} invested ${req.body.amount} to ${req.body.dealname}`)

    const newInvest = new Invest({
        investor: req.body.investor,
        dealname: req.body.dealname,
        amount: req.body.amount
    });

    try {
        res.send(await newInvest.save());
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post("/getbyuser", async (req, res) => {
    console.log('get user investment', req.body)
    try {
        res.send(await Invest.find({ investor: req.body.userName }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/list/:dealname', async (req, res) => {
    const { dealname } = req.params;
    try {
        res.send(await Invest.find({ dealname: dealname }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/summary/:dealname', async (req, res) => {
    const { dealname } = req.params;

    try {
        const result = await Invest.aggregate([
            { $match: { dealname } },
            {
                $addFields: {
                    amountAsNumber: { $toDouble: "$amount" } // Convert string to number
                }
            },
            {
                $group: {
                    _id: "$dealname",
                    uniqueInvestors: { $addToSet: "$investor" },
                    totalAmount: { $sum: "$amountAsNumber" } // Sum converted number
                }
            },
            {
                $project: {
                    _id: 0,
                    dealname: "$_id",
                    investorCount: { $size: "$uniqueInvestors" },
                    totalAmount: 1
                }
            }
        ]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;