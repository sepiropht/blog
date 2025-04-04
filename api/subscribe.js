import nodemailer from 'nodemailer';

// Create the transporter outside the handler for better performance
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Export the handler as a default export for Vercel serverless functions
export default async function handler(req, res) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the request body
    const data = req.body; // In Vercel, req.body is automatically parsed as JSON for POST requests
    const { email } = data;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    // Add subscriber to Listmonk
    const auth = btoa(`${process.env.LISTMONK_USER}:${process.env.LISTMONK_TOKEN}`);
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Step 1: Add subscriber to list
    const subscribeResponse = await fetch('https://listmonk.sepiropht.me/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        email: email,
        name: '',
        status: 'enabled',
        lists: [4],
        attribs: {
          join_date: currentDate,
        },
      }),
    });

    const subscribeData = await subscribeResponse.json();

    if (!subscribeResponse.ok) {
      console.error('Error adding subscriber:', subscribeData);
      return res.status(500).json({
        error: 'Failed to add subscriber',
        details: subscribeData.message || 'Unknown error',
      });
    }

    // Step 2: Send welcome email using Nodemailer
    try {
      // Create a beautiful HTML email
      const htmlEmail = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Our Newsletter!</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 20px;
            }
            h1 {
              color: #007bff;
              margin-bottom: 15px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 4px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Newsletter!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>
              <p>You'll now receive updates on:</p>
              <ul>
                <li>Latest blog posts and articles</li>
                <li>Exclusive content and insights</li>
                <li>Tips, tricks, and best practices</li>
              </ul>
              <p>If you have any questions or feedback, feel free to reply to this email.</p>
              <p>Best regards,<br>The Team</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sepiropht.me" class="button">Visit Our Website</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sepiropht. All rights reserved.</p>
            <p>You received this email because you signed up for our newsletter.</p>
          </div>
        </body>
        </html>
      `;

      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Sepiropht Blog" <sepiropht@sepiropht.me>',
        to: email,
        subject: 'Welcome to Our Newsletter!',
        html: htmlEmail,
      });

      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      return res.status(200).json({
        success: true,
        warning: 'Subscriber added, but failed to send welcome email',
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}