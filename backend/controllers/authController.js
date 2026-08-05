import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Pool from "../models/Pool.js";
import Comment from "../models/Comment.js";
import { generateOtp, otpExpiry, otpValid, sendOtpEmail } from "../utils/otp.js"; 
import { uploadToCloudinary } from "../config/cloudinary.js";

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const clean = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  username: u.username,
  avatar: u.avatar,
  bio: u.bio,
});

// To register a user and send otp to email
export const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "User already exists..!" });

    let avatar = "";
    if (req.file) {
      try {
        avatar = await uploadToCloudinary(req.file.buffer);
      } catch (e) {
        console.warn("Avatar upload skipped:", e.message);
      }
    }

    const otp = generateOtp();
    await User.create({
      name,
      email,
      username,
      password,
      avatar,
      otp,
      otpExpires: otpExpiry(),
    });

    await sendOtpEmail(email, otp, "verify your email please.!");
    res.status(201).json({
      needsVerification: true,
      email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// To verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }); // Fixed: Added lookup

    if (!user) return res.status(404).json({ message: "User not found!" });

    if (!user.isVerified && !otpValid(user, otp))
      return res.status(400).json({ message: "invalid or expired otp!" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      token: makeToken(user._id),
      user: clean(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// To resend otp
export const resendOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.otp = generateOtp();
    user.otpExpires = otpExpiry();
    await user.save();

    await sendOtpEmail(user.email, user.otp, "verify your email");
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({
        message: "please verify your email first",
        needsVerification: true,
        email,
      });

    res.json({
      token: makeToken(user._id),
      user: clean(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// To update your profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username && username !== user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: "Username already taken" });
      user.username = username;
    }
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      try {
        user.avatar = await uploadToCloudinary(req.file.buffer);
      } catch (e) {
        console.warn("Avatar upload skipped:", e.message);
      }
    }
    await user.save();
    res.json({ user: clean(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// To change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters long" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// To delete account
export const deleteAccount = async (req, res) => {
  try {
    const id = req.userId;
    const mypools = await Pool.find({ creator: id }).select("_id");
    const mypoolIds = mypools.map((p) => p._id);

    await Comment.deleteMany({ $or: [{ user: id }, { pool: { $in: mypoolIds } }] });
    await Pool.deleteMany({ creator: id });
    await Pool.updateMany({}, { $pull: { votes: { user: id } } });
    await User.findByIdAndDelete(id);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// To get logged in user's profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const [created, voted] = await Promise.all([
      Pool.countDocuments({ creator: user._id }),
      Pool.countDocuments({ "votes.user": user._id }),
    ]);

    res.json({
      user: clean(user),
      stats: {
        created,
        voted,
        bookmarked: user.bookmarks.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};