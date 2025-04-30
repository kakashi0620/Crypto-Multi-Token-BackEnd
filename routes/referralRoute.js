const express = require('express');
const router = express.Router();

const Referral = require("../models/referral");

// Admin - Get All Referrals
router.get("/getAllReferrals", async (req, res) => {
    try {
        const currentReferrals = await Referral.find();
        res.send(currentReferrals);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Admin - Delete the current Referral
router.delete("/deleteReferral/:id", async (req, res) => {
    try {
        const court = await Referral.findById(req.params.id);

        if (!court) {
            return res.status(404).json({ message: "No court found" })
        }

        await Referral.findByIdAndDelete(req.params.id);
        res.send("Referral deleted successfully");

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/withdrawable/:userid", async (req, res) => {
    const {userid} = req.params
    console.log(`Get withdrawable data for ${userid}`)
    try {
        const withdrawables = await getWithdrawableGrouped(userid, 'Waiting');
        res.send(withdrawables);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Helper functions.
async function getWithdrawableGrouped(userId, state) {
    const result = await Referral.aggregate([
      {
        $match: {
          to: userId,
          state: state,
        },
      },
      {
        $group: {
          _id: {
            level: '$level',
            from: '$from',
            date: '$date',
            chain: '$chain',
            wallet: '$wallet',
            state: '$state',
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          level: '$_id.level',
          from: '$_id.from',
          date: '$_id.date',
          chain: '$_id.chain',
          wallet: '$_id.wallet',
          amount: 1,
          state: '$_id.state',
        },
      },
      {
        $sort: { level: 1 } // Optional: Sort by level
      }
    ]);
  
    return result;
  }

module.exports = router;