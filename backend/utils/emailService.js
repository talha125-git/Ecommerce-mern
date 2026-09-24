const nodemailer = require("nodemailer");

/**
 * Creates a transporter for Gmail or custom SMTP.
 */
let cachedTransporter = null;

function getTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || "").replace(/\s+/g, "");

  if (user && pass && !user.includes("your-email@gmail.com")) {
    // If Gmail account or default, use Nodemailer's native Gmail service preset
    if (user.includes("@gmail.com") || !process.env.SMTP_HOST) {
      console.log(`📧 [EmailService] Initializing Real Gmail Transporter for: ${user}`);
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: user.trim(),
          pass: pass.trim(),
        },
      });
    }

    // Custom SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
  }

  return null;
}

/**
 * Sends a newsletter verification email.
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<{success: boolean, previewUrl?: string, error?: string}>}
 */
async function sendNewsletterVerificationEmail(email, token) {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com"
      : "http://localhost:5173");

  const verificationUrl = `${frontendUrl}/newsletter/verify?token=${encodeURIComponent(
    token
  )}`;

  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  let transporter = getTransporter();

  // If no Gmail credentials set yet, fall back to Ethereal so the server doesn't crash
  let isRealGmail = false;
  if (transporter) {
    isRealGmail = true;
  } else {
    console.warn("⚠️ [EmailService] Real Gmail credentials not detected in backend/.env.");
    console.warn("⚠️ Please set EMAIL_USER=your-email@gmail.com and EMAIL_PASS=your-16-char-app-password in backend/.env to send real emails.");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (e) {
      console.error("Could not create test mail account:", e.message);
    }
  }

  const senderAddress = user || "no-reply@bloomshop.com";
  const mailOptions = {
    from: `"BloomShop" <${senderAddress}>`,
    to: email,
    subject: "Confirm your BloomShop Newsletter Subscription",
    text: `Welcome to BloomShop!\n\nPlease confirm your subscription by visiting the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\nIf you didn't subscribe, you can safely ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .header span { color: #f59e0b; }
          .body { padding: 32px 28px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
          .text { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background-color: #f59e0b; color: #0f172a !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2); }
          .btn:hover { background-color: #d97706; }
          .link-box { background-color: #f1f5f9; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #475569; margin-bottom: 24px; }
          .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BLOOM<span>SHOP</span></h1>
          </div>
          <div class="body">
            <h2 class="title">Verify your email address</h2>
            <p class="text">
              Thanks for subscribing to the BloomShop newsletter! Please click the button below to verify your email address and activate your subscription to receive exclusive offers, new drops, and style inspiration.
            </p>
            <div class="btn-container">
              <a href="${verificationUrl}" class="btn" target="_blank">Confirm My Subscription</a>
            </div>
            <p class="text" style="font-size: 12px; margin-bottom: 8px;">
              If the button doesn't work, copy and paste this link into your web browser:
            </p>
            <div class="link-box">
              <a href="${verificationUrl}" style="color: #0284c7; text-decoration: none;">${verificationUrl}</a>
            </div>
            <p class="text" style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
              * This verification link is valid for 24 hours. If you did not request this newsletter subscription, you can safely disregard this message.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} BloomShop. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  console.log("\n=======================================================");
  console.log(isRealGmail ? "📧 [SENDING REAL GMAIL VIA SMTP]" : "📧 [FALLBACK DEV EMAIL]");
  console.log(`From: ${senderAddress}`);
  console.log(`To: ${email}`);
  console.log(`🔗 Verification Link: ${verificationUrl}`);
  console.log("=======================================================\n");

  if (!transporter) {
    return {
      success: true,
      verificationUrl,
      previewUrl: null,
      isRealGmail: false,
    };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    
    let testPreviewUrl = null;
    if (!isRealGmail) {
      testPreviewUrl = nodemailer.getTestMessageUrl(info);
      if (testPreviewUrl) {
        console.log(`🌐 Test Preview URL: ${testPreviewUrl}`);
      }
    }

    return {
      success: true,
      isRealGmail,
      verificationUrl,
      previewUrl: testPreviewUrl,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("❌ [EmailService] Failed to send email via Gmail:", err.message);
    if (err.message.includes("Username and Password not accepted") || err.code === "EAUTH") {
      console.error("👉 Please ensure you generated a 16-character Google App Password (not your normal password): https://myaccount.google.com/apppasswords");
    }
    return {
      success: false,
      isRealGmail,
      verificationUrl,
      error: err.message,
    };
  }
}

module.exports = {
  sendNewsletterVerificationEmail,
};
