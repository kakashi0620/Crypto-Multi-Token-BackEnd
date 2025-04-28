const express = require('express');
const router = express.Router();

const Deal = require("../models/deal");
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
router.post("/add", async (req, res) => {
    console.log(`${req.body.dealname} Add a new distribution.\nType: ${req.body.type}, Date: ${req.body.date}, Percent: ${req.body.percent}`)

    // Update deal state
    try {
        const deal = await Deal.findOne({ name: req.body.dealname })

        const newState = 'Distributing'
        if (deal.state !== newState) {
            await Deal.updateOne({ _id: deal._id }, { $set: { state: newState } });
            console.log('Deal state updated to Distributing.')
        }
    }
    catch (e) {
        console.log('Fetching deal data error:', e)
    }

    // Update schedule
    const newDistribution = new Distribution({
        dealname: req.body.dealname,
        type: req.body.type,
        date: req.body.date,
        percent: req.body.percent
    });

    try {
        res.send(await newDistribution.save());
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.get("/getbydeal/:dealname", async (req, res) => {
    const { dealname } = req.params;
    try {
        res.send(await Distribution.find({ dealname: dealname }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/summary", async (req, res) => {
    const { dealname, date } = req.query;
    console.log(`distribution summary received => dealname: ${dealname}, date: ${date}`)

    try {
        const targetDate = new Date(date);
        const nextSchedule = await Distribution.findOne({
            dealname,
            date: { $gt: targetDate }
        }).sort({ date: 1 });

        let nextType = 'No schedule'
        let nextDate = 'No schedule'
        let totalReceived = 0
        let nextPercent = 0
        if (nextSchedule !== null) {
            nextType = nextSchedule.type
            nextDate = nextSchedule.date
            nextPercent = nextSchedule.percent
        }

        const schedulesBefore = await Distribution.find({
            dealname,
            date: { $lte: targetDate }
        });
        if (schedulesBefore !== null) {
            totalReceived = schedulesBefore.reduce((sum, item) => sum + item.percent, 0);
        }

        res.json({
            type: nextType,
            date: nextDate,
            totalReceived,
            percent: nextPercent
        });


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get("/getcurbatch/:dealname", async (req, res) => {
    const { dealname } = req.params;
    console.log(`Get current batch received => dealname: ${dealname}`)

    const now = new Date();

    // Find distributions for the dealname, before or equal to now
    const distributions = await Distribution.find({
        dealname: dealname,
        date: { $lte: now },
    }).sort({ date: -1 }); // Sort by date descending

    if (distributions.length > 0) {
        const latest = distributions[0];
        console.log(`  Current batch => ${latest.type} ${latest.percent}`)

        res.json({
            type: latest.type,
            percent: latest.percent
        })
    }
    else {
        res.json({
            type: "",
            percent: 0
        })
    }
});

module.exports = router;