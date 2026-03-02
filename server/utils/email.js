const nodemailer = require('nodemailer');

const sendFoodReadyEmail = async (studentEmail, orderId, studentName) => {
    try {
        console.log(`Attempting to send email to ${studentEmail} for order ${orderId}...`);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log('SMTP server is ready to take our messages');
        } catch (verifyError) {
            console.error('SMTP Verification Error:', verifyError);
            throw new Error(`SMTP Verification Failed: ${verifyError.message}`);
        }

        const mailOptions = {
            from: `"SHS Canteen Kiosk" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: 'Your Canteen Order is Ready! 🍔',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #002366;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #002366; margin: 0;">SHS Canteen</h1>
            <p style="color: #64748b; margin: 5px 0;">University of Perpetual Help System DALTA</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="margin-top: 0;">Hello ${studentName}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">Your order <strong style="color: #FFD700;">#${orderId.substring(orderId.length - 6).toUpperCase()}</strong> is now <strong>Ready to Serve</strong>.</p>
            <p style="font-size: 16px; line-height: 1.6;">Please proceed to the canteen counter to claim your food.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #64748b;">
            <p>Thank you for using the SHS Canteen Kiosk!</p>
            <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Detailed Email Error:', error);
        return false;
    }
};

module.exports = {
    sendFoodReadyEmail
};
