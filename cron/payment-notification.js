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
              <body>
                <p>Hello ${user.username},</p>
                <p>This is a reminder to pay your monthly fee. Have you made the payment?</p>
                <p>If not, please make the payment using the link below:</p>
                <p><a href="${paymentLink}">Pay Now</a></p>
                <p>Thank you!</p>
                <p>Best regards,<br>Digital Idir Team</p>
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
