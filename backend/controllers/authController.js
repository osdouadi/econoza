const {
  addUser,
  authenticatedUser,
  RequestOTPVerification,
  resendVerificationCode,
} = require("../services/authServices");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;
    await addUser(name, email, phoneNumber, password, req, res);
    next();
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500) && next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await authenticatedUser(email, password, req, res);
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ status: "error", message: "Authentication failed" });
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    await RequestOTPVerification(userId, otp, req, res);
    next();
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ status: "error", message: "OTP Verification failed failed" });
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    await resendVerificationCode(userId, email, req, res);
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: "error", message: "Error sending OTP" });
  }
};

module.exports = { registerUser, loginUser, verifyOTP, resendOTP };
