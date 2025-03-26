const express = require('express');
const router = express.Router();

const User = require("../models/user");

// Registration
router.post("/register", async (req, res) => {
    // console.log(req.body.email);
    // const existedUser = await User.find({email: req.body.email});
    // console.log(existedUser);
    // if (existedUser) {
    //     res.send("The same email is already exist!");
    //     return;
    // }
    // console.log('reasdfasdfasdfasdfasd!!!!');

    const newUser = new User({
        name: req.body.name,
        birthday: req.body.birthday,
        unit: req.body.unit,
        group: req.body.group,
        email: req.body.email,
        password: req.body.password,
    });

    try {
        const savedUser = await newUser.save()
        
        res.send("User registered successfully!");
    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existedUser = await User.findOne({
            email: email,
            password: password
        });

        if (existedUser) {
            const userData = {
                name: existedUser.name,
                email: existedUser.email,
                isAdmin: existedUser.isAdmin,
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