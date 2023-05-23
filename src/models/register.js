const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const empSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,

  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// GENERATING TOKENS

empSchema.methods.generateAuthToken = async function () {
  try {
    console.log(this._id);
    const token = await jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();

    return token;
  } catch (e) {
    console.log(`The error is: ${e}`);
  }
};

// CONVERTING PASSWORD INTO HASH
empSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.cpassword = await bcrypt.hash(this.confirmpassword, 10);

    // console.log(`The current password is ${this.password}`)
    // console.log(`The current password is ${this.password}`)
  }
  next();
});

// create a collection
const Register = new mongoose.model("Register", empSchema);

module.exports = Register;
