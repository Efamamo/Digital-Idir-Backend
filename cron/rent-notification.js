const sgMail = require('@sendgrid/mail');
const User = require('../models/user');

const sendRentNotification = async (rent) => {
  // Format the list of items into a string
  const formattedItems = rent.items
    .map((item) => {
      return `<li>${item.name}: ${item.quantity} x $${item.unit_amount.toFixed(
        2
      )}</li>`;
    })
    .join('');

  // Create the HTML content for the email
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333333;">Hello ${rent.name},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">Here is your rent information:</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;"><strong>ID:</strong> ${
            rent._id
          }</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;"><strong>Items:</strong></p>
          <ul style="font-size: 16px; line-height: 1.6; color: #555555;">
            ${formattedItems}
          </ul>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;"><strong>Total Amount:</strong> $${rent.totalAmount.toFixed(
            2
          )}</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">
            Please do not lose this information. You will need to present this data to the Idir to retrieve your items.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">
            Thank you for using Digital Idir!
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #555555;">
            Best regards,<br>
            <strong>Digital Idir Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  const msg = {
    to: rent.email,
    from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Rent Information',
    html: htmlContent, // Use the HTML formatted content here
  };

  // Send the email
  try {
    await sgMail.send(msg);
    console.log('Rent notification sent successfully.');
  } catch (error) {
    console.error('Error sending rent notification:', error);
  }
};

module.exports = sendRentNotification;
