const sgMail = require('@sendgrid/mail');
const User = require('../models/user');

const sendRentNotification = async (rent) => {
  // Format the list of items into a string
  const formattedItems = rent.items
    .map((item) => {
      return `- ${item.name}: ${item.quantity} x $${item.unit_amount.toFixed(
        2
      )}`;
    })
    .join('\n');

  // Create the message body with formatted items and additional instructions
  const messageBody = `
Hello ${rent.name},

Here is your rent information:

ID: ${rent._id}

Items:
${formattedItems}

Total Amount: $${rent.totalAmount.toFixed(2)}

Please do not lose this information. You will need to present this data to the Idir to retrieve your items.

Thank you for using Digital Idir!

Best regards,
Digital Idir Team
`;

  const msg = {
    to: rent.email,
    from: `Digital Idir <${process.env.SENDGRID_SENDER_EMAIL}>`,
    subject: 'Rent Information',
    text: messageBody, // Use the formatted message body here
  };

  // Send the email
  await sgMail.send(msg);
};

module.exports = sendRentNotification;
