const cron = require('node-cron');
const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
require('dotenv').config();

// Schedule a job to run at midnight on the first day of every month
cron.schedule('0 0 1 * *', async () => {
  try {
    const users = await User.find();
    console.log(users);

    const paymentLink =
      'http://localhost:5000/api/v1/transactions/monthly-payment';

    for (const user of users) {
      const msg = {
        to: user.email,
        from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: `Monthly Payment`,
        html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333333;">Hello ${user.username},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                This is a friendly reminder to pay your monthly fee. Have you had a chance to make the payment?
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                If not, please complete your payment using the link below:
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                <a href="${paymentLink}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Pay Now</a>
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                Thank you!
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                Best regards,<br>
                <strong>Digital Idir Team</strong>
              </p>
            </div>
          </body>
        </html>
      `,
      };
      await sgMail.send(msg);
    }
  } catch (error) {
    console.error('Error checking borrowed items:', error);
  }
});
