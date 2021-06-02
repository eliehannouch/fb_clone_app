const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const userExist = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (userExist) {
      return res.status(409).json({ message: "User already exists" });
    }
    if (
      req.body.username === "" ||
      req.body.email === "" ||
      req.body.password === ""
    ) {
      return res
        .status(400)
        .json(
          "You are not able to create a valid account. Missing Required fields"
        );
    }
    // Hashing the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // Creating the user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    // Saving the user to the database
    const user = await newUser.save();

    // return filtered document
    const { password, updatedAt, createdAt, ...other } = user._doc;
    res.status(201).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with the provided credentials is not found" });
    }

    if (req.body.email.trim() === "" || req.body.password.trim() === "") {
      return res
        .status(400)
        .json("You are not allowed to login. Missing Required fields !!");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect credentials" });
    }
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
