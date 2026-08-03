import User from "../models/User.js";
import { generateOtp, otpExpiry, otpValid, sendOtpEmail } from "../utils/otp.js";

// If user forgets password, send an OTP mail
export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "No account with this email" });

        user.otp = generateOtp();
        user.otpExpires = otpExpiry();

        await user.save();
        await sendOtpEmail(user.email, user.otp, "Reset Quorum password");
        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

// To verify if OTP is valid
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!otpValid(user, otp)) return res.status(400).json({ message: "Invalid or expired OTP" });
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

// To reset password after verifying OTP
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        // Fixed: checking newPassword instead of undefined 'password'
        if (!newPassword || newPassword.length < 8)
            return res.status(400).json({ message: "Password must be at least 8 characters long" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!otpValid(user, otp)) return res.status(400).json({ message: "Invalid or expired OTP" });

        // Fixed: saving newPassword
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;
        await user.save();
        
        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
};