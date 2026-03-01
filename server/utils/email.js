const nodemailer = require('nodemailer');

const sendFoodReadyEmail = async (studentEmail, orderId, studentName) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use other services
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: 'Your Canteen Order is Ready! 🍔',
            html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #002366;">
          <h2>Hello ${studentName}!</h2>
          <p>Your order <strong>#${orderId}</strong> is now <strong>Ready to Serve</strong>.</p>
          <p>Please proceed to the canteen counter to claim your food.</p>
          <br>
          <p>Thank you for using the SHS Canteen Kiosk!</p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${studentEmail} for order ${orderId}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    sendFoodReadyEmail
};
