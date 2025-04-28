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

        if (nextSchedule === null) {
            res.json({
                type: 'No schedule',
                date: 'No schedule',
                totalReceived: 0,
                percent: 0
            });
        }
        else {
            const schedulesBefore = await Distribution.find({
                dealname,
                date: { $lte: targetDate }
            });

            const totalReceived = schedulesBefore.reduce((sum, item) => sum + item.percent, 0);
            res.json({
                type: nextSchedule.type,
                date: nextSchedule.date,
                totalReceived,
                percent: nextSchedule.percent
            });
        }

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
        const err = "Batch not found."
        console.error(err);
        res.status(500).json({ error: err });
    }
});

module.exports = router;