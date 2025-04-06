const express = require('express');
const router = express.Router();

const User = require("../models/user");

// Registration
router.post("/register", async (req, res) => {

    console.log(`Add user => loginWallet: ${req.body.loginWallet}`)

    const newUser = new User({
        userName: req.body.userName,
        userId: req.body.userId,
        enterDate: req.body.enterDate,
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        permanentAddress: req.body.permanentAddress,
        country: req.body.country,
        mobileNumber: req.body.mobileNumber,
        telegramId: req.body.telegramId,
        twitterId: req.body.twitterId,
        discordId: req.body.discordId,
        loginWallet: req.body.loginWallet,
        btcWallet: req.body.btcWallet,
        solanaWallet: req.body.solanaWallet,
        anotherWallet1: req.body.anotherWallet1,
        anotherWallet2: req.body.anotherWallet2,
        referred_by: req.body.referred_by
    });

    try {
        await newUser.save()

        res.send("User registered successfully!");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});

router.post("/update", async (req, res) => {

    console.log(`Update user => loginWallet: ${req.body.loginWallet}`)

    let user = null;
    try {
        user = await User.findOne({ userId: req.body.userId });
    } catch (error) {
        console.log(error);
        return res
            .status(404)
            .json({ message: "Could not find the user", success: false });
    }

    user.userName = req.body.userName;
    user.userId = req.body.userId;
    user.enterDate = req.body.enterDate;
    user.fullName = req.body.fullName;
    user.emailAddress = req.body.emailAddress;
    user.permanentAddress = req.body.permanentAddress;
    user.country = req.body.country;
    user.mobileNumber = req.body.mobileNumber;
    user.telegramId = req.body.telegramId;
    user.twitterId = req.body.twitterId;
    user.discordId = req.body.discordId;
    user.loginWallet = req.body.loginWallet;
    user.btcWallet = req.body.btcWallet;
    user.solanaWallet = req.body.solanaWallet;
    user.anotherWallet1 = req.body.anotherWallet1;
    user.anotherWallet2 = req.body.anotherWallet2;
    user.referred_by = req.body.referred_by;

    try {
        await user.save()

        res.send("User update successfully!");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


router.post("/getuser", async (req, res) => {
    console.log(`get user signal received => ${req.body.address}`)
    try {
        res.send(await User.findOne({ loginWallet: req.body.address }));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existedUser = await User.findOne({
            loginWallet: loginWallet,
        });

        if (existedUser) {
            const userData = {
                userName: existedUser.userName,
                userId: existedUser.userId,
                emailAddress: existedUser.emailAddress,
                loginWallet: existedUser.loginWallet,
                referred_by: existedUser.referred_by,
                _id: existedUser._id,
            }
            res.send(userData);
        } else {
            return res.status(400).json({ message: "Login is failed!" });
        }

    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


// Admin - Get All Users
router.get("/getAllUsers", async (req, res) => {
    try {
        const currentUsers = await User.find();
        res.send(currentUsers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get("/getUserCount", async (req, res) => {
    try {
        const currentUsers = await User.find();

        res.send(currentUsers.length.toString());
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current User
router.delete("/deleteUser/:id", async (req, res) => {
    try {
        const court = await User.findById(req.params.id);

        if (!court) {
            return res.status(404).json({ message: "No court found" })
        }

        await User.findByIdAndDelete(req.params.id);
        res.send("User deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



module.exports = router;