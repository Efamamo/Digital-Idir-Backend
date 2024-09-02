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
            from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
            subject: `Reminder: ${event.title}`,
            html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333333;">Hello ${user.username},</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                This is a friendly reminder for today's event:
              </p>
              <h2 style="color: #1a73e8; font-size: 24px; margin: 10px 0;">${event.title}</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Date:</strong> ${event.date}
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Location:</strong> ${event.location}
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Description:</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                ${event.description}
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                We look forward to seeing you there!
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
