import User from "../models/User";
import { sendOtpEmail } from "../utils/emailSender";
import { generateOtp, otpExpiry } from "../utils/otpGenerator";

// if user forgoots passwords send an otp mail

export const forgotPasswrod = async (res, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({
            message:"no account with this email"
        });

        user.otp = generateOtp();
        user.otpExpires = otpExpiry();

        await user.save();
        await sendOtpEmail(user.email, user.otp, "Reset quorun password");
        res.json({
            message: "OTP sent to your email"
        });

    }
    catch (err){
        res.status(500).json({
            message: "something went wrong"
        }); 
    }
}

// to verify otp is valid

export const verifyResetOtp = async (req, res) => {
    try {
        const {email, otp} = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            message:"user not found"
        }); 

        if (!otpValid(user, otp)) return res.status(400).json({
            message: "invalid or expired otp"
        });
        res.status(200).json({ ok: true });
    }
    catch (err){
        res.status(500).json({
            message: "something went wrong"
        }); 
}
}

//  to reset password after verifying otp

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!password || password.length < 8)
            return res.status(400).json({
        message: "password must be at least 8 char long"})
    }
    catch (err){

    }