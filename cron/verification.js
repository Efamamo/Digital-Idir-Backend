const sgMail = require('@sendgrid/mail');

const sendVerification = async (user) => {
  const verificationUrl = `http://localhost:5000/api/v1/auth/verify/${user.verificationToken}`;
  const msg = {
    to: user.email,
    from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Verify your email',
    html: `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333333;">Verify Your Email Address</h2>
          <p>Hello ${user.username},</p>
          <p>Thank you for registering with us! To complete the sign-up process, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #1a73e8; text-decoration: none; border-radius: 5px;">Verify Email</a>
          </p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Best regards,<br>Digital Idir Team</p>
        </div>
      </body>
    </html>
  `,
  };
  await sgMail.send(msg);
};

module.exports = sendVerification;
