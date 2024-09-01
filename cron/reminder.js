const cron = require('node-cron');
const sgMail = require('@sendgrid/mail');
const Event = require('../models/event');
const User = require('../models/user');
require('dotenv').config();

// Set up SendGrid transporter
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Cron job to check for today's events every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Start of the day (00:00:00)
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day (23:59:59)
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all events for today that haven't had reminders sent yet
    const events = await Event.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      reminderSent: false,
    });

    if (events.length > 0) {
      const users = await User.find({});

      for (const user of users) {
        for (const event of events) {
          // Send email reminder to each user for each event
          const msg = {
            to: user.email,
            from: process.env.SENDGRID_SENDER_EMAIL,
            subject: `Reminder: ${event.title}`,
            text: `Hello ${user.username}, this is a reminder for today's event: "${event.title}" at ${event.date}. Location: ${event.location}. Description: ${event.description}.`,
          };
          await sgMail.send(msg);
        }
      }

      // Mark all events as having reminders sent
      await Event.updateMany(
        { _id: { $in: events.map((event) => event._id) } },
        { reminderSent: true }
      );
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
});
