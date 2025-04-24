const express = require('express');
const cron = require('node-cron');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra')

const Deal = require("../models/deal");
const Invest = require("../models/invest");


// Update deal state every hour.
cron.schedule('* * * * *', async () => {
    console.log('🔁 Running deal state update job...');

    const deals = await Deal.find();

    const now = new Date();

    for (const deal of deals) {
        let newState = 'Draft';
        if (deal.state === 'Draft') {
            const createdPlus24h = new Date(deal.createdate.getTime() + 24 * 60 * 60 * 1000);
            if (now.getTime() >= createdPlus24h.getTime() && now.getTime() < deal.livedate.getTime()) {
                newState = 'Upcoming';
            }
        } else if (deal.state === 'Fundraising') {
            const result = await Invest.aggregate([
                { $match: { dealname: deal.name } },
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
                const investamount = result[0].totalAmount
                if (investamount >= deal.fundrasing)
                    newState = 'Awaiting TGE';
            }
        } else if (deal.state === 'Upcoming') {
            if (now.getTime() >= new Date(deal.livedate).getTime()) {
                newState = 'Fundraising';
            }
        }
        
        if (newState !== 'Draft' && deal.state !== newState) {
            await Deal.updateOne({ _id: deal._id }, { $set: { state: newState } });
            console.log(`✅ Updated deal "${deal.state}" to state: ${newState}`);
        }
    }

    console.log('✅ Deal state update job completed.');
});

// Upload image
const uploadsDir = './upload/';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Store the file in the uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file name
    },
});

const upload = multer({ storage: storage });

// API route to handle image upload and form data submission
router.post('/create', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
]), async (req, res) => {
    const { logo, banner } = req.files;
    const { name, round, tokenprice, fdv, mc, vesttge, vestcliff, vestgap, fundrasing, fee, investmin, investmax, test, weburl, xurl, discordurl, teleurl, tc_pulltrust, tc_pinmsg, tc_answer, tc_responsible, tc_acknowledge, tc_allocation, tc_never, livedate, createdate, timezone, state } = req.body;

    // Check if user already exists
    // console.log(email);
    const dealExists = await Deal.findOne({ name });
    if (dealExists) {
        return res.status(400).json({ message: 'Deal already exists' });
    }

    if (!logo || !banner) {
        return res.status(400).json({ success: false, message: 'Both logo and banner are required.' });
    }

    const logoUrl = `${uploadsDir}${logo[0].filename}`; // URL to the uploaded logo
    const bannerUrl = `${uploadsDir}${banner[0].filename}`; // URL to the uploaded banner

    try {
        const newDeal = await Deal.create({
            name,
            logo: logoUrl,
            banner: bannerUrl,
            round,
            tokenprice,
            fdv,
            mc,
            vesttge,
            vestcliff,
            vestgap,
            fundrasing,
            fee,
            investmin,
            investmax,
            test,
            weburl,
            xurl,
            discordurl,
            teleurl,
            tc_pulltrust,
            tc_pinmsg,
            tc_answer,
            tc_responsible,
            tc_acknowledge,
            tc_allocation,
            tc_never,
            livedate: new Date(livedate),
            createdate: new Date(createdate),
            timezone,
            state
        });

        res.status(200).json({ success: true, message: 'Data and images uploaded successfully!', data: newDeal });
    } catch (err) {
        console.error('Error saving deal:', err);
        res.status(500).json({ success: false, message: 'Error uploading form data' });
    }
});

router.get("/getalldeals", async (req, res) => {
    console.log("get all deal received.")
    try {
        res.send(await Deal.find());
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post("/getdeal", async (req, res) => {
    console.log('get deal received:', req.body.name)
    try {
        res.send(await Deal.findOne({ name: req.body.name }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/getdealbystate", async (req, res) => {
    console.log('get deal by state received:', req.body.state)
    try {
        res.send(await Deal.find({ state: req.body.state }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/getfordistribution", async (req, res) => {
    try {
        res.send(await Deal.find({ state: { $in: ['Awaiting TGE', 'Distributing'] } }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;