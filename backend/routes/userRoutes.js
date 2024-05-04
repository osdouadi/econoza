const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/user-login", authController.loginUser);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resendOTPVerificationCode", authController.resendOTP);

module.exports = router;