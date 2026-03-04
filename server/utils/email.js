const sendFoodReadyEmail = async (studentEmail, orderId, studentName) => {
  try {
    console.log(`Attempting to send email via Brevo to ${studentEmail} for order ${orderId}...`);

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error('Missing BREVO_API_KEY environment variable');
    }

    const shortOrderId = orderId.substring(orderId.length - 6).toUpperCase();

    const senderEmail = process.env.SENDER_EMAIL || "noreply@shscanteen.com";

    const payload = {
      sender: {
        name: "SHS Canteen",
        email: senderEmail // Must be a verified sender email in your Brevo account
      },
      to: [
        {
          email: studentEmail,
          name: studentName
        }
      ],
      subject: `Your Order #${shortOrderId} is Ready!`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Hello ${studentName},</h2>
          <p style="font-size: 16px; color: #34495e;">Great news! Your order <strong>#${shortOrderId}</strong> is now ready for pickup at the SHS Canteen.</p>
          <p style="font-size: 16px; color: #34495e;">Please proceed to the claiming area and present your order number.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 14px; color: #7f8c8d;">Thank you!</p>
          <p style="font-size: 14px; color: #7f8c8d;"><strong>- SHS Canteen Team</strong></p>
        </div>
      `
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API Error: ${response.status} ${errorText}`);
    }

    console.log(`Email sent successfully via Brevo!`);
    return true;
  } catch (error) {
    console.error('Detailed Email Error:', error);
    return false;
  }
};

module.exports = {
  sendFoodReadyEmail
};
