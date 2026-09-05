import express from "express";

import {
  signupUser,
  loginUser,
  logoutUser,
  google,
  getUserProfile,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/google", google);

// Protected profile route
router.get("/profile", authMiddleware, getUserProfile);

export default router;
