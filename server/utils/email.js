const sendFoodReadyEmail = async (studentEmail, orderId, studentName) => {
  try {
    console.log(`Attempting to send email via EmailJS to ${studentEmail} for order ${orderId}...`);

    const shortOrderId = orderId.substring(orderId.length - 6).toUpperCase();

    // The EmailJS REST API payload
    const payload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        student_email: studentEmail,
        student_name: studentName,
        order_id: shortOrderId,
        // any other variables you put in your EmailJS template using {{variable_name}}
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
