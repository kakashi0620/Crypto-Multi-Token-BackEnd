const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra')

const Deal = require("../models/deal");


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
    const { name, round, tokenprice, fdv, mc, vest, fundrasing, fee, investmin, investmax, test, weburl, xurl, discordurl, teleurl, tc_pulltrust, tc_pinmsg, tc_answer, tc_responsible, tc_acknowledge, tc_allocation, tc_never, livedate, createdate, timezone, state } = req.body;

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
            vest,
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
    try {
        res.send(await Deal.find());
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;