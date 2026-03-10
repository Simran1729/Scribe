export const otpTemplate = (otp : string) => {
    return `
    <h2>Your OTP Code</h2>
    <p>Your OTP is <b> ${otp}</b></p>
    <p>This OTP will expire in 5 minutes</p>
    `
}