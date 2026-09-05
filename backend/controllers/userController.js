import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

/*const domain =
  process.env.NODE_ENV === "production"
    ? "taskmanger-server-qg2o.onrender.com"
    : "localhost";*/

// =========================
// SIGNUP
// =========================

const signupUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }

  const existUser = await userModel.findOne({ email });

  if (existUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();

    generateToken(res, newUser._id);

    res.status(201).json({
      success: true,
      _id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    res.status(400).json({
      message: error.message,
    });
  }
});

// =========================
// LOGIN
// =========================

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const existingUser = await userModel.findOne({ email });

  if (!existingUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }

  generateToken(res, existingUser._id);

  res.status(200).json({
    success: true,
    _id: existingUser._id,
    firstname: existingUser.firstname,
    lastname: existingUser.lastname,
    email: existingUser.email,
  });
});

// =========================
// GET USER PROFILE
// =========================

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user)
    .select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json(user);
});

// =========================
// LOGOUT
// =========================

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
});

// =========================
// GOOGLE LOGIN
// =========================

const google = asyncHandler(async (req, res) => {
  const { name, email, googlePhotoUrl } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const { password, ...rest } = user._doc;

      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          domain,
          signed: true,
          path: "/",
          secure: true,
          sameSite: "None",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(
        generatedPassword,
        10
      );

      const newUser = new userModel({
        firstname: name,
        lastname: name,
        email,
        profilePicture: googlePhotoUrl,
        password: hashedPassword,
      });

      await newUser.save();

      const token = jwt.sign(
        {
          id: newUser._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const { password, ...rest } = newUser._doc;

      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          domain,
          signed: true,
          path: "/",
          secure: true,
          sameSite: "None",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .json(rest);
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

export {
  signupUser,
  loginUser,
  getUserProfile,
  logoutUser,
  google,
};
