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
        res.send(await Invest.find({ investor: req.body.userName}));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;