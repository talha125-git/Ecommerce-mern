const nodemailer = require("nodemailer");
const SubscriberModel = require("../models/Subscriber");

/**
 * Creates a transporter for Gmail or custom SMTP.
 */
function getTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || "").replace(/\s+/g, "");

  if (user && pass && !user.includes("your-email@gmail.com")) {
    if (user.includes("@gmail.com") || !process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: user.trim(),
          pass: pass.trim(),
        },
      });
    }

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
  let isRealGmail = Boolean(transporter);

  if (!transporter) {
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
    text: `Welcome to BloomShop!\n\nPlease confirm your subscription by visiting the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
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

  if (!transporter) {
    return { success: true, verificationUrl, isRealGmail: false };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email dispatched! Message ID: ${info.messageId}`);
    return {
      success: true,
      isRealGmail,
      verificationUrl,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("❌ [EmailService] Failed to send verification email:", err.message);
    return {
      success: false,
      isRealGmail,
      verificationUrl,
      error: err.message,
    };
  }
}

/**
 * Sends a New Product Announcement email to all verified subscribers.
 * @param {object} product - Product object
 */
async function sendNewProductToSubscribers(product) {
  const verifiedSubscribers = await SubscriberModel.find({
    isVerified: true,
    status: "subscribed",
  });

  if (!verifiedSubscribers || verifiedSubscribers.length === 0) {
    console.log("ℹ️ [EmailService] No verified subscribers to notify for new product.");
    return { success: true, count: 0, message: "No subscribers found." };
  }

  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  let transporter = getTransporter();

  if (!transporter) {
    console.warn("⚠️ [EmailService] No mail transporter configured to send new product emails.");
    return { success: false, count: 0, error: "Email transporter not configured." };
  }

  const frontendUrl =
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com"
      : "http://localhost:5173");

  const productUrl = `${frontendUrl}/product/${product._id || product.id}`;
  const senderAddress = user || "no-reply@bloomshop.com";
  const primaryImage = product.image || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800";

  const discountBadge = product.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? `<span style="background-color: #ef4444; color: #ffffff; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; margin-left: 8px;">SAVE Rs. ${Number(product.originalPrice) - Number(product.price)}</span>`
    : "";

  const emailsList = verifiedSubscribers.map((s) => s.email);

  console.log(`🚀 [EmailService] Dispatching New Product Alert for "${product.name}" to ${emailsList.length} subscribers...`);

  const mailOptions = {
    from: `"BloomShop" <${senderAddress}>`,
    to: senderAddress, // Primary to avoid disclosing recipient list
    bcc: emailsList, // Send BCC to all subscribers securely
    subject: `🔥 New Arrival: ${product.name} is now available at BloomShop!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Product Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .header span { color: #f59e0b; }
          .badge { display: inline-block; background-color: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; }
          .body { padding: 32px 28px; }
          .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px; }
          .category { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
          .img-box { width: 100%; border-radius: 14px; overflow: hidden; background-color: #f1f5f9; margin: 20px 0; border: 1px solid #e2e8f0; text-align: center; }
          .img-box img { width: 100%; max-height: 380px; object-fit: cover; display: block; }
          .price-box { margin: 20px 0; font-size: 24px; font-weight: 900; color: #0f172a; display: flex; align-items: center; }
          .desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 28px 0 16px; }
          .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 15px; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); }
          .footer { background: #f8fafc; padding: 22px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BLOOM<span>SHOP</span></h1>
          </div>
          <div class="body">
            <span class="badge">🔥 Fresh Drop Alert</span>
            <div class="category">${product.category} • ${product.subcategory || "Footwear"}</div>
            <h2 class="title">${product.name}</h2>

            <div class="img-box">
              <img src="${primaryImage}" alt="${product.name}" />
            </div>

            <div class="price-box">
              Rs. ${Number(product.price).toLocaleString()}
              ${product.originalPrice ? `<span style="font-size: 16px; color: #94a3b8; text-decoration: line-through; margin-left: 8px;">Rs. ${Number(product.originalPrice).toLocaleString()}</span>` : ""}
              ${discountBadge}
            </div>

            <p class="desc">
              ${product.description || "A brand-new exclusive style just landed on BloomShop. Experience exceptional craftsmanship, sleek modern ergonomics, and premium materials."}
            </p>

            <div class="btn-container">
              <a href="${productUrl}" class="btn" target="_blank">Shop This Drop Now →</a>
            </div>
          </div>
          <div class="footer">
            You received this exclusive notification because you are a verified BloomShop subscriber.<br/>
            © ${new Date().getFullYear()} BloomShop. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ New product alert sent to ${emailsList.length} subscribers! Message ID: ${info.messageId}`);
    return { success: true, count: emailsList.length, messageId: info.messageId };
  } catch (err) {
    console.error("❌ Failed to broadcast new product to subscribers:", err.message);
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Sends a custom broadcast / campaign email to subscribers.
 * @param {object} params - { subject, heading, message, buttonText, buttonLink, targetEmails }
 */
async function sendCampaignEmail({ subject, heading, message, buttonText, buttonLink, targetEmails }) {
  let recipients = [];

  if (Array.isArray(targetEmails) && targetEmails.length > 0) {
    recipients = targetEmails;
  } else {
    const subs = await SubscriberModel.find({ isVerified: true, status: "subscribed" });
    recipients = subs.map((s) => s.email);
  }

  if (recipients.length === 0) {
    return { success: false, sentCount: 0, error: "No subscribers found to send to." };
  }

  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  const transporter = getTransporter();

  if (!transporter) {
    return { success: false, sentCount: 0, error: "Email transporter not configured." };
  }

  const frontendUrl =
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com"
      : "http://localhost:5173");

  const senderAddress = user || "no-reply@bloomshop.com";
  const ctaLink = buttonLink || `${frontendUrl}/shop`;
  const formattedMessage = (message || "").replace(/\n/g, "<br/>");

  const mailOptions = {
    from: `"BloomShop" <${senderAddress}>`,
    to: senderAddress,
    bcc: recipients,
    subject: subject || "Update from BloomShop",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .header span { color: #f59e0b; }
          .body { padding: 36px 30px; }
          .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px; line-height: 1.3; }
          .text { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 28px; }
          .btn-container { text-align: center; margin: 32px 0 20px; }
          .btn { display: inline-block; background-color: #f59e0b; color: #0f172a !important; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 34px; border-radius: 12px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25); }
          .footer { background: #f8fafc; padding: 22px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BLOOM<span>SHOP</span></h1>
          </div>
          <div class="body">
            <h2 class="title">${heading || subject}</h2>
            <div class="text">
              ${formattedMessage}
            </div>

            ${
              buttonText
                ? `
              <div class="btn-container">
                <a href="${ctaLink}" class="btn" target="_blank">${buttonText}</a>
              </div>
            `
                : ""
            }
          </div>
          <div class="footer">
            You received this announcement because you are a verified BloomShop subscriber.<br/>
            © ${new Date().getFullYear()} BloomShop. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Campaign email sent to ${recipients.length} recipients! Message ID: ${info.messageId}`);
    return { success: true, sentCount: recipients.length, messageId: info.messageId };
  } catch (err) {
    console.error("❌ Failed to send campaign email:", err.message);
    return { success: false, sentCount: 0, error: err.message };
  }
}

module.exports = {
  sendNewsletterVerificationEmail,
  sendNewProductToSubscribers,
  sendCampaignEmail,
};
