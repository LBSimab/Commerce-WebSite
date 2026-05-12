/**
 * Email Utility
 *
 * Sends emails using Gmail SMTP.
 * Used for password reset codes.
 */

import nodemailer from "nodemailer";

// Create transporter with Gmail SMTP

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_EMAIL,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// Send password reset email
export async function sendPasswordResetEmail(to, resetCode) {
  /// since we have no internet connection in iran we are going to mock this in the console with the reset link!

  console.log("=== PASSWORD RESET ===");
  console.log(`Email: ${to}`);
  console.log(`Reset Code: ${resetCode}`);
  console.log(
    `Link: http://localhost:3000/fa/reset-password?email=${to}&code=${resetCode}`,
  );
  console.log("======================");
  console.log("Copy the reset code and use it on /reset-password");
  console.log("");

  //this is the real one here when we get internet back were gucci!

  // const mailOptions = {
  //   from: `"SahandCover" <${process.env.SMTP_EMAIL}>`,
  //   to,
  //   subject: "Password Reset Code - SahandCover",
  //   html: `
  //     <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
  //       <h2 style="color: #4f46e5;">SahandCover</h2>
  //       <p>You requested a password reset.</p>
  //       <p>Your reset code is:</p>
  //       <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; margin: 20px 0;">
  //         ${resetCode}
  //       </div>
  //       <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
  //       <p style="color: #6b7280; font-size: 14px;">If you didn't request this, ignore this email.</p>
  //     </div>
  //   `,
  // };

  // return transporter.sendMail(mailOptions);

  return { messageId: "dev-mode-logged-to-console" };
}
