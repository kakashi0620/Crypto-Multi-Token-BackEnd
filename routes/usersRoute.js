const express = require('express');
const router = express.Router();

const User = require("../models/user");

// Registration
router.post("/register", async (req, res) => {
    
    console.log('register request received.')

    const newUser = new User({
        userName: req.body.userName,
        userId: req.body.userId,
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
        referral: req.body.referral
    });

    try {
        const savedUser = await newUser.save()
        
        res.send("User registered successfully!");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


router.post("/getuser", async (req, res) => {
    console.log(`get user signal received => ${req.body.address}`)
    try {
        res.send(await User.find({ loginWallet: req.body.address }));
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
                referral: existedUser.referral,
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