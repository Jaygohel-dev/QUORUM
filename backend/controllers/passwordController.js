import User from "../models/User";


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
        await sendOtpEmail()

    }
}