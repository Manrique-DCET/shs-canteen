const { Resend } = require('resend');

const sendFoodReadyEmail = async (studentEmail, orderId, studentName) => {
  try {
    console.log(`Attempting to send email via EmailJS to ${studentEmail} for order ${orderId}...`);

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      throw new Error('Missing EmailJS environment variables');
    }

    const shortOrderId = orderId.substring(orderId.length - 6).toUpperCase();

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        student_name: studentName,
        order_id: shortOrderId,
        student_email: studentEmail
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API Error: ${response.status} ${errorText}`);
    }

    console.log(`Email sent successfully via EmailJS!`);
    return true;
  } catch (error) {
    console.error('Detailed Email Error:', error);
    return false;
  }
};

module.exports = {
  sendFoodReadyEmail
};
