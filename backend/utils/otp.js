import nodemailer from 'nodemailer';

// 1. Setup the transporter (The "Mail Truck")
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Set this in your .env file
        pass: process.env.EMAIL_PASS  // Use your 16-char App Password here
    }
});

// Your existing logic
export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export const otpValid = (user, otp) =>
    user.otp === otp && user.otpExpires > new Date();

// 2. The real email sending logic
export const sendOtpEmail = async (email, otp, subject) => {
    try {
        await transporter.sendMail({
            from: '"Quorum Support" <your-email@gmail.com>', // Sender address
            to: email, // Receiver
            subject: subject,
            text: `Your OTP for verification is: ${otp}. It will expire in 10 minutes.`,
            html: `<b>Your OTP is: ${otp}</b>` // HTML body
        });
        console.log(`Email successfully sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};