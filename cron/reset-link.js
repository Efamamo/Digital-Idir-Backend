const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const sendPasswordResetLink = async (token, user) => {
  const resetLink = `http://localhost:5000/api/v1/auth/reset-password?token=${token}`;
  const msg = {
    to: user.email,
    from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Password Reset Request',
    html: `<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #555;">
        Hello ${user.username},
      </p>
      <p style="font-size: 16px; color: #555;">
        We received a request to reset your password. Click the button below to reset your password. This link is valid for the next 1 hour.
      </p>
      <p style="text-align: center;">
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #1a73e8; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </p>
      <p style="font-size: 14px; color: #888;">
        If you did not request a password reset, please ignore this email or contact support if you have questions.
      </p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888;">
        Thank you,<br>
        The Digital Idir Team
      </p>
    </div>
  </body>
</html>`,
  };
  await sgMail.send(msg);
};

module.exports = sendPasswordResetLink;
