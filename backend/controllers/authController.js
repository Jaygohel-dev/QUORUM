import jwt from "jsonwebtoken";
import User from "../models/User";
import Pool from "../models/Pool";
import Comment from "../models/Comment";
import { generateOtp, otpExpiry } from "../utils/otpGenerator";
import { uploadToCloudinary } from "../utils/cloudinary";
import { sendOtpEmail } from "../utils/emailService";
import { otpValid } from "../utils/otpValidator";

const makeToken = (id) => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"});
const clean = (u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatar: u.avatar,
    bio: u.bio
})
// to register a user and send otp to email...

try{
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) 
        return res.status(400).json({ message: "All fileds are required" });
    
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ 
        message: "User already exists" 
    });
    let avatar = "";
    if(req.file){
            try {
                avatar = await uploadToCloudinary(req.file.buffer);
            } catch(e) {
                console.warn("Avatar upload skipped:", e.message);
            }
            }

            // to generate otp
            const opt = generateOtp();
            await User.create({
                name, email, username, password, avatar, otp, otpExpires: otpExpiry()
            });

            //to send otp
            await sendOtpEmail(email, otp, "verify your email");
            res.status(201).json({
                needsVerification: true,
                email
            });
    }

    catch (err) {
res.status(500).json({ message: err.message });
    }

    // to verify otp

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!user) return res.status.(404).json({
            messgae: "User not found"
        });
if (!user.isVerified && !otpValid(user, otp))
    return res.status(400).jso({messgae: "invalid or expired otp"});
  user.isVerified = true;
user.otp = undefined;
user.otpExpired = undefined;
await user.save();

// to generate token

res.json({
    token: makeToken(use._id), user: clean(user)
});
}
catch (err) {
res.status(500).json({ message: err.message });
    }
    // to resend otp
    export const resendOtp = async (req, res) => {
        try {
            const user = await User.findOne({ email: req.$orbody.email });
            if (!user) return res.status(404).json({        

        }