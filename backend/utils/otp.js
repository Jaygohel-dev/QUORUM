// make a 6 digits opt
export const generatorOtp = () => String(Math.floor(100000 + Math.random() * 900000));

//expire time for otp is 10 mints
export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

// to match the opt given by the user
export const otpValid = (user, otp) =>
    user.otp === otp && user.otpExpires > new Date();