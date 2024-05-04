const jwt = require("jsonwebtoken");
const User = require("./../schemas/userSchema");
const { sendOTPVerificationEmail, sendSLE } = require("./emailService");
const UserOTPVerification = require("../schemas/userOTPVerification");
const bcrypt = require("bcryptjs");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const jwtExpiresInParser = (expiresIn) => {
  const [value, unit] = expiresIn.match(/\d+|\D+/g);
  const ms = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * ms[unit];
};

const composeAndDeliverToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + jwtExpiresInParser(process.env.JWT_EXPIRES_IN)
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

exports.addUser = async (name, email, phoneNumber, password, req, res) => {
  try {
    const newUser = await User.create({ name, email, phoneNumber, password });

    composeAndDeliverToken(newUser, 201, req, res);
  } catch (error) {
    console.log("Registration failed", error);
  }
};

exports.authenticatedUser = async (email, password, req, res) => {
  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
      throw new Error("Incorrect email or password", 401);
    }

    await sendOTPVerificationEmail(user._id, user.email, res);
  } catch (error) {
    console.log(error);
    throw new Error("Authentication failed", error);
  }
};

const findOTPRecords = async (userId, otp, userOTPRecords) => {
  if (!userId || !otp) {
    throw Error("Empty otp details are not allowed");
  } else {
    if (userOTPRecords <= 0) {
      throw new Error(
        "Account records do not exist or account has been already verified."
      );
    }
  }
};

const checkOTPNotExpired = async (userOTPRecords, userId) => {
  const { expiresAt } = userOTPRecords[0];
  const ParsedExpiresAt = Date.parse(expiresAt);

  if (ParsedExpiresAt > Date.now()) {
    await UserOTPVerification.deleteMany({ userId });
  } else {
    throw new Error("Code has expired. Please request again");
  }
};

const compareOTPVerificationCode = async (otp, hashedOTP) => {
  const validOTP = await bcrypt.compare(otp, hashedOTP);
  if (!validOTP) throw new Error("Invalid code passed. Check your inbox");
};

const validateOTPVerificationCode = async (userId) => {
  await User.updateOne({ _id: userId }, { verified: true });
  await UserOTPVerification.deleteMany({ userId });
};

exports.RequestOTPVerification = async (userId, otp, req, res) => {
  try {
    const user = await User.findOne({ _id: userId }).select("+password");
    const userOTPRecords = await UserOTPVerification.find({ userId });
    const hashedOTP = userOTPRecords[0].otp;

    await findOTPRecords(userId, otp, userOTPRecords);
    await checkOTPNotExpired(userOTPRecords, userId);
    await compareOTPVerificationCode(otp, hashedOTP);
    await validateOTPVerificationCode(userId);
    await composeAndDeliverToken(user, 200, req, res);
    await sendSLE(user.name, user.email);
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

exports.resendVerificationCode = async (userId, email, req, res) => {
  try {
    if (!userId || !email) {
      throw Error("Empty user details are not allowed");
    } else {
      await UserOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail(userId, email, res);
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};
