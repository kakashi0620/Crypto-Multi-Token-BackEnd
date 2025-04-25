const express = require('express');
const router = express.Router();

const Deal = require("../models/deal");
const Invest = require("../models/invest");


// Main routes
router.post("/invest", async (req, res) => {

    const investor = req.body.investor
    const dealname = req.body.dealname
    let amount = req.body.amount
    console.log(`${investor} invested ${amount} to ${dealname}`)

    const curInvest = await getTotalInvestAmount(dealname)
    const {dealID, target} = await getFundraisingTarget(dealname)
    const investableAmount = target - curInvest
    if (investableAmount <= amount) {
        amount = investableAmount
        migrateDealAwaiting(dealID)
    }

    const newInvest = new Invest({
        investor: investor,
        dealname: dealname,
        amount: amount
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

// Helper functions
const getTotalInvestAmount = async(dealname) => {
    try {
        const result = await Invest.aggregate([
            { $match: { dealname: dealname } },
            {
                $addFields: {
                    amountAsNumber: { $toDouble: "$amount" } // Convert string to number
                }
            },
            {
                $group: {
                    _id: "$dealname",
                    totalAmount: { $sum: "$amountAsNumber" } // Sum converted number
                }
            },
            {
                $project: {
                    _id: 0,
                    dealname: "$_id",
                    totalAmount: 1
                }
            }
        ]);
    
        if (result.length > 0) {
            return result[0].totalAmount
        }
    }
    catch(e) {
        console.log('Collecting invest amount is failed:', e)
    }

    return 0
}

const getFundraisingTarget = async(dealname) => {
    try {
        const deal = await Deal.findOne({ name: dealname })
        return { dealID: deal._id, target: deal.fundrasing }
    }
    catch(e) {
        console.log('Getting deal is failed:', e)
    }

    return 0
}

const migrateDealAwaiting = async(dealID) => {
    await Deal.updateOne({ _id: dealID }, { $set: { state: 'Awaiting TGE' } });
    console.log(`Deal migrated to Awaiting TGE`)
}

module.exports = router;