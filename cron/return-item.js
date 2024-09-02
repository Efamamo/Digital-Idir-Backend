const cron = require('node-cron');
const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
require('dotenv').config();

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    // Find users with non-empty borrowedItems array
    const users = await User.find({
      borrowedItems: { $exists: true, $not: { $size: 0 } },
    });

    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; 
    const currentDate = new Date();

    for (const user of users) {
      for (const item of user.borrowedItems) {
        const borrowedDate = new Date(item.date);
        const diffTime = currentDate - borrowedDate;

        if (diffTime >= oneWeekInMs) {
          const msg = {
            to: user.email,
            from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
            subject: `Reminder: Returning Borrowed Item`,
            text: `Hello ${user.username}, this is a remind you to return ${item.amount} ${item.name} you borrowed at ${item.date}`,
          };
          await sgMail.send(msg);
        }
      }
    }
  } catch (error) {
    console.error('Error checking borrowed items:', error);
  }
});
