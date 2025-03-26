const express = require('express');
const router = express.Router();

const Device = require("../models/device");

// Get All Devices
router.get("/getAllDevices", async (req, res) => {
    try {
        const devices = await Device.find({});
        res.send(devices);

    } catch (error) {
        return res.status(400).json({ message: error });
    }
});


// Get Device By ID
router.post("/getDeviceById", async (req, res) => {
    const deviceId = req.body.deviceId;

    try {
        const device = await Device.findOne({ _id: deviceId })
        res.send(device);

    } catch (error) {
        return res.status(400).json({ message: error });
    }
});



// Admin - Add New Device
router.post("/addDevice", async (req, res) => {
    try {
        const newDevice = new Device(req.body);
        await newDevice.save();
        res.send("New Device added successfully");
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});


// Admin - Delete the current Device
router.delete("/deleteDevice/:id", async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({ message: "No device found" })
        }

        await Device.findByIdAndDelete(req.params.id);
        res.send("Device deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


module.exports = router;