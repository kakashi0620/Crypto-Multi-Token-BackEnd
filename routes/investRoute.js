const express = require('express');
const router = express.Router();

const User = require("../models/user");
const Deal = require("../models/deal");
const Referral = require("../models/referral");
const Invest = require("../models/invest");


// Main routes
router.post("/invest", async (req, res) => {

    const investor = req.body.investor
    const dealname = req.body.dealname
    let amount = req.body.amount
    console.log(`${investor} invested ${amount} to ${dealname}`)

    // Update deal state
    const curInvest = await getTotalInvestAmount(dealname)
    const { dealID, target } = await getFundraisingTarget(dealname)
    const investableAmount = target - curInvest
    if (investableAmount <= amount) {
        amount = investableAmount
        migrateDealAwaiting(dealID)
    }

    // Add referral
    addReferral(investor, dealname, amount)

    // Add invest data
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
    console.log(`invest summary received => deal name: ${dealname}`)

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

        let investorCount = 0
        let totalAmount = 0
        if (result.length > 0) {
            investorCount = result[0].investorCount
            totalAmount = result[0].totalAmount
        }

        res.json({
            investorCount: investorCount,
            totalAmount: totalAmount,
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getreferralfee/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const referFamily = await getReferralFamily(username, 100)
        const totalfee = referFamily.reduce((total, item) => total + item.amount, 0)
        res.json({ referralfee: totalfee })
    } catch (error) {
        res.json({ referralfee: 0 })
    }
});

// Helper functions
const getTotalInvestAmount = async (dealname) => {
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
    catch (e) {
        console.log('Collecting invest amount is failed:', e)
    }

    return 0
}

const getFundraisingTarget = async (dealname) => {
    try {
        const deal = await Deal.findOne({ name: dealname })
        return { dealID: deal._id, target: deal.fundrasing }
    }
    catch (e) {
        console.log('Getting deal is failed:', e)
    }

    return 0
}

const migrateDealAwaiting = async (dealID) => {
    await Deal.updateOne({ _id: dealID }, { $set: { state: 'Awaiting TGE' } });
    console.log(`Deal migrated to Awaiting TGE`)
}

const referralPercents = [0.015, 0.0035, 0.0015]; // Levels 1 to 3

async function getReferralFamily(userName, amount) {
    const result = [];

    let currentUser = await User.findOne({ userName });
    if (!currentUser) {
        throw new Error('User not found');
    }

    let fromUserId = currentUser.userId;

    for (let level = 1; level <= 3; level++) {
        const referrer = await User.findOne({ userId: currentUser.referred_by });
        if (!referrer) break;

        const reward = parseFloat((amount * referralPercents[level - 1]).toFixed(2));

        result.push({
            from: fromUserId,
            toid: referrer.userId,
            toname: referrer.userName,
            level,
            amount: reward,
        });

        currentUser = referrer; // move up the referral chain
    }

    return result;
}

const addReferral = async (investor, dealname, amount) => {
    const family = await getReferralFamily(investor, amount)
    
    try {
        for (let i = 0; i < family.length; i++) {
            const newReferral = new Referral({
                dealname: dealname,
                from: family[i].from,
                to: family[i].toid,
                toname: family[i].toname,
                level: family[i].level,
                amount: family[i].amount,
            });
            
            await newReferral.save()
        }
        
        console.log(`Referral db is updated.`)
    } catch (error) {
        console.log(error)
    }
}

module.exports = router;