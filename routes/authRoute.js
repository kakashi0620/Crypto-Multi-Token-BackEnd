const express = require("express");
const {
  createUser,
  loginUser,
  handleRefreshToken,
  logout,
  updateUser,
  getallUsers,
  getaUser,
  deleteUser,
  updatePassword,
  getUserMetaList,
  getNotification,
  deleteDocBatch,
  importDoc
} = require("../controller/userCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/delete-batch", authMiddleware, deleteDocBatch);
router.post("/import", authMiddleware, importDoc);

router.put("/password", authMiddleware, updatePassword);
router.put("/update", authMiddleware, updateUser);

router.get("/all-users", authMiddleware, isAdmin, getallUsers);
router.get("/meta-list", getUserMetaList);
router.get("/notification", getNotification);
router.get("/refresh", handleRefreshToken);
router.get("/item/:id", authMiddleware, isAdmin, getaUser);
router.get("/logout", logout);

router.delete("/:id", authMiddleware, isAdmin, deleteUser);


module.exports = router;
