export const otpTemplate = (otp : string) => {
    return `
    <h2>Your OTP Code</h2>
    <p>Your OTP is <b> ${otp}</b></p>
    <p>This OTP will expire in 5 minutes</p>
    `
}

export const passwordResetTemplate = (token: string) => {
  const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`

  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it. This link is valid for <b>5 minutes</b>:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, ignore this email.</p>
      </body>
    </html>
  `
}