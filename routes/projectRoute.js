const express = require("express");
const controller = require("../controller/projectCtrl");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/delete-batch", authMiddleware, controller.deleteDocBatch);
router.post("/", authMiddleware, controller.createDoc);
router.post("/import", authMiddleware, controller.importDoc);

router.put("/:id", authMiddleware, controller.updateDoc);
router.delete("/:id", authMiddleware, controller.deleteDoc);
router.get("/", authMiddleware, controller.getAllDoc);

module.exports = router;
