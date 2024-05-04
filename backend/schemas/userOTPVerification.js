const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userOTPVerificationSchema = new Schema({
  userId: mongoose.Schema.Types.ObjectId,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

userOTPVerificationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userOTPVerificationSchema.set("toJSON", {
  virtuals: true,
});

const UserOTPVerification = mongoose.model(
  "userOTPVerificationSchema",
  userOTPVerificationSchema
);

module.exports = UserOTPVerification;
