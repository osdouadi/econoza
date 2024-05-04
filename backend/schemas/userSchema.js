const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    min: [1, "1 is minimum character count of name field"],
    required: [true, "Name field is required"],
  },
  email: {
    type: String,
    required: [true, "Email field is required"],
    unique: [true, "There is an account registerd with this email"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "Phone number field is required"],
  },
  password: {
    type: String,
    required: [true, "Password field is required"],
    validate: {
      validator: function (value) {
        // Passowrd should contain:
        // At least one uppercase.
        // At least one lowercase.
        // At least one special character.
        // At least one number.
        // Minimum length of 8 characters.

        const regex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(value);
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one special character, one number, and have a minimum length of 8 characters",
    },
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  insertedPassword,
  userPassword
) {
  return await bcrypt.compare(insertedPassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
