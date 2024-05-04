const fs = require("fs");
const bcrypt = require("bcryptjs");
const UserOTPVerification = require("./../schemas/userOTPVerification");
const { transporter } = require("../utils/email");

exports.sendOTPVerificationEmail = async (_id, email, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const userOTPVerificationTemplate = fs.readFileSync(
      `${__dirname}/../templates/userOTPVerification.html`,
      "utf-8"
    );

    const html = userOTPVerificationTemplate.replace("{{otp}}", otp);

    // Mail options
    const mailOptions = {
      from: "client@gmail.com",
      to: email,
      subject: "Verify Your email",
      html: html,
    };

    // hash the OTP
    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    // save OTP record
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "Verification OTP email sent",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

exports.sendSLE = async (name, email) => {
  try {
    const successfullLoginTemplate = fs.readFileSync(
      `${__dirname}/../templates/successfullLoginEmailTemplate.html`,
      "utf-8"
    );

    const html = successfullLoginTemplate.replace("{{name}}", name);

    // Mail options
    const mailOptions = {
      from: "client@gmail.com",
      to: email,
      subject: "You logged in successfully",
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
