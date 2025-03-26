const express = require("express");
const controller = require("../controller/equipmentCtrl");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, controller.createDoc);
router.post("/add-batch", authMiddleware, controller.createDocBatch);
router.post("/delete-batch", authMiddleware, controller.deleteDocBatch);
router.post("/import", authMiddleware, controller.importDoc);

router.get("/detail/:id", controller.getOneDoc);

router.put("/:id", authMiddleware, controller.updateDoc);
router.delete("/:id", authMiddleware, controller.deleteDoc);

router.get("/summary", authMiddleware, controller.getSummary);
router.get("/", authMiddleware, controller.getAllDoc);


module.exports = router;
