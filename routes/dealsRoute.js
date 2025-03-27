const express = require('express');
const router = express.Router();

const Deal = require("../models/deal");

// Registration
router.post("/register", async (req, res) => {

    const newDeal = new Deal({
        dealName: req.body.dealName,
        logo: req.body.logo,
        banner: req.body.banner,
        round: req.body.round,
        tokenPrice: req.body.tokenPrice,
        fullyDilutedValuation: req.body.fullyDilutedValuation,
        initialMarketCap: req.body.initialMarketCap,
        vestingSummary: req.body.vestingSummary,
        fundraisingTarget: req.body.fundraisingTarget,
        fees: req.body.fees,
        minInvestLimit: req.body.minInvestLimit,
        maxInvestLimit: req.body.maxInvestLimit,
        test: req.body.test,
        twitterURL: req.body.twitterURL,
        discordURL: req.body.discordURL,
        telegramURL: req.body.telegramURL,
    });

    try {
        const savedDeal = await newDeal.save()
        
        res.send("Deal registered successfully!");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existedDeal = await Deal.findOne({
            dealName: dealName,
        });

        if (existedDeal) {
            const dealData = {
                dealName: existedDeal.dealName,
                tokenPrice: existedDeal.tokenPrice,
                webURL: existedDeal.webURL,
                twitterURL: existedDeal.twitterURL,
                discordURL: existedDeal.discordURL,
                telegramURL: existedDeal.telegramURL,
                _id: existedDeal._id,
            }
            res.send(dealData);
        } else {
            return res.status(400).json({ message: "Login is failed!" });
        }

    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


// Admin - Get All Deals
router.get("/getAllDeals", async (req, res) => {
    try {
        const currentDeals = await Deal.find();
        res.send(currentDeals);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current Deal
router.delete("/deleteDeal/:id", async (req, res) => {
    try {
        const court = await Deal.findById(req.params.id);

        if (!court) {
            return res.status(404).json({ message: "No court found" })
        }

        await Deal.findByIdAndDelete(req.params.id);
        res.send("Deal deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



module.exports = router;